import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as http from 'http';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // IP 地理位置缓存，避免重复请求被 ip-api.com 限流
  private geoCache = new Map<string, { country: string; region: string; city: string; isp: string; cachedAt: number }>();
  private readonly GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

  private parseDevice(userAgent: string): string {
    if (!userAgent) return '未知';
    if (/iPad/.test(userAgent)) return '平板';
    if (/iPhone|Android.*Mobile|Mobile/.test(userAgent)) return '手机';
    return '电脑';
  }

  private async geoIp(ip: string): Promise<{ country: string; region: string; city: string; isp: string }> {
    const fallback = { country: '', region: '', city: '', isp: '' };
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return { country: '本地', region: '', city: '', isp: '' };
    }

    // 查缓存
    const cached = this.geoCache.get(ip);
    if (cached && Date.now() - cached.cachedAt < this.GEO_CACHE_TTL) {
      return { country: cached.country, region: cached.region, city: cached.city, isp: cached.isp };
    }

    // 查数据库：同 IP 之前查过的记录
    const existing = await this.prisma.loginLog.findFirst({
      where: { ip, country: { not: '' } },
      orderBy: { loginAt: 'desc' },
    });
    if (existing && existing.country) {
      const result = { country: existing.country, region: existing.region || '', city: existing.city || '', isp: existing.isp || '' };
      this.geoCache.set(ip, { ...result, cachedAt: Date.now() });
      return result;
    }

    // 请求 API
    return new Promise((resolve) => {
      const req = http.get(
        `http://ip-api.com/json/${ip}?fields=country,regionName,city,isp&lang=zh-CN`,
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              const result = { country: json.country || '', region: json.regionName || '', city: json.city || '', isp: json.isp || '' };
              if (result.country) {
                this.geoCache.set(ip, { ...result, cachedAt: Date.now() });
              }
              resolve(result);
            } catch {
              resolve(fallback);
            }
          });
        },
      );
      req.on('error', () => resolve(fallback));
      req.setTimeout(3000, () => { req.destroy(); resolve(fallback); });
    });
  }

  async login(email: string, ip?: string, userAgent?: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email, nickname: email.split('@')[0] },
      });
    }

    const geo = await this.geoIp(ip || '');
    const device = this.parseDevice(userAgent || '');

    await this.prisma.loginLog.create({
      data: {
        userId: user.id,
        email,
        ip: ip || null,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        isp: geo.isp,
        device,
        userAgent: userAgent ? userAgent.slice(0, 300) : null,
      },
    });

    return user;
  }

  async logAdminLogin(ip?: string, userAgent?: string) {
    const geo = await this.geoIp(ip || '');
    const device = this.parseDevice(userAgent || '');
    await this.prisma.loginLog.create({
      data: {
        userId: null,
        email: 'admin',
        ip: ip || null,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        isp: geo.isp,
        device,
        userAgent: userAgent ? userAgent.slice(0, 300) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getLoginLogs(limit = 200) {
    return this.prisma.loginLog.findMany({
      orderBy: { loginAt: 'desc' },
      take: limit,
    });
  }
}
