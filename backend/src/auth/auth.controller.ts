import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Post('admin-login')
  async adminLogin(@Body() body: { username: string; password: string }, @Req() req: Request) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'travelmap2024';

    if (body.username === adminUsername && body.password === adminPassword) {
      const token = this.jwtService.sign({ role: 'admin' });
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';
      this.usersService.logAdminLogin(ip, userAgent).catch(() => {});
      return { success: true, token };
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
