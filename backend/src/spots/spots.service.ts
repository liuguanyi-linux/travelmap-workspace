import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false, includeInactive: boolean = false) {
    const where: any = {};
    
    if (!includeExpired) {
      where.OR = [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ];
    }
    
    if (!includeInactive) {
      where.isActive = true;
    }

    const spots = await this.prisma.spot.findMany({ 
      where,
      select: {
        id: true,
        name: true,
        cnName: true,
        city: true,
        address: true,
        lng: true,
        lat: true,
        photos: true,
        videos: true,
        intro: true,
        content: true,
        tags: true,
        rank: true,
        isTop: true,
        isActive: true,
        phone: true,
        wechat: true,
        kakao: true,
        email: true,
        viewCount: true,
        expiryDate: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isTop: 'desc' }, // Top items first
        { rank: 'asc' },   // Lower rank number = higher priority (1, 2, 3...)
        { createdAt: 'desc' }
      ]
    });
    return spots.map(s => this.transform(s));
  }

  async findOne(id: any) {
    const spot = await this.prisma.spot.findUnique({ where: { id: BigInt(id) } });
    if (!spot) return null;
    return this.transform(spot);
  }

  async create(data: any) {
    const serialize = (val: any) => typeof val === 'string' ? val : JSON.stringify(val || []);
    const finalLng = data.location?.lng ?? data.lng;
    const finalLat = data.location?.lat ?? data.lat;

    const spot = await this.prisma.spot.create({
      data: {
        id: BigInt(Date.now()),
        name: data.name,
        cnName: data.cnName || null,
        city: data.city,
        address: data.address || null,
        lng: finalLng,
        lat: finalLat,
        photos: serialize(data.photos),
        tags: serialize(data.tags),
        intro: data.intro || null,
        content: data.content || null,
        rank: data.rank ?? 99,
        isTop: data.isTop ?? false,
        isActive: data.isActive ?? true,
        phone: data.phone || null,
        wechat: data.wechat || null,
        kakao: data.kakao || null,
        email: data.email || null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      }
    });
    return this.transform(spot);
  }

  async update(id: any, data: any) {
    const { id: _id, tags, photos, reviews, location, lng, lat, videos, ...rest } = data;
    const updateData: any = { ...rest };
    const serialize = (val: any) => typeof val === 'string' ? val : JSON.stringify(val || []);

    if (tags !== undefined) updateData.tags = serialize(tags);
    if (photos !== undefined) updateData.photos = serialize(photos);
    
    if (location !== undefined) {
      updateData.lng = location.lng;
      updateData.lat = location.lat;
    } else {
      if (lng !== undefined) updateData.lng = lng;
      if (lat !== undefined) updateData.lat = lat;
    }

    const spot = await this.prisma.spot.update({
      where: { id: BigInt(id) },
      data: updateData
    });
    return this.transform(spot);
  }

  async remove(id: any) {
    return this.prisma.spot.delete({ where: { id: BigInt(id) } });
  }

  async updateStatus(id: number | string, isActive: boolean) {
    const numericId = BigInt(id);
    
    const spot = await this.prisma.spot.update({
      where: { id: numericId },
      data: { isActive }
    });
    return this.transform(spot);
  }

  private transform(spot: any) {
    const parseJSON = (str: string | null, fallback: any = []) => {
      if (!str) return fallback;
      try {
        const parsed = JSON.parse(str);
        // Ensure we don't return null if JSON.parse returns null (e.g. for "null" string)
        // Also ensure we return an array for list fields to prevent frontend crashes
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (e) {
        console.warn(`[SpotsService.transform] Failed to parse JSON for spot ${spot.id}:`, str);
        return typeof str === 'string' ? [str] : fallback;
      }
    };

    return {
      ...spot,
      content: spot.content || '',
      tags: parseJSON(spot.tags),
      photos: parseJSON(spot.photos),
      reviews: [], // Legacy compatibility
      location: (spot.lng && spot.lat) ? { lng: spot.lng, lat: spot.lat } : undefined
    };
  }

  async incrementView(id: any) {
    const bigIntId = BigInt(id);
    await this.prisma.spot.update({ where: { id: bigIntId }, data: { viewCount: { increment: 1 } } });
  }
}
