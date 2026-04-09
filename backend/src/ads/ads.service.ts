import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false) {
    const where = includeExpired ? {} : {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };
    const ads = await this.prisma.ad.findMany({ where });
    return ads.map(ad => ({
      ...ad,
      photos: ad.photos ? JSON.parse(ad.photos) : []
    }));
  }

  async findOne(id: number) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) return null;
    return {
      ...ad,
      photos: ad.photos ? JSON.parse(ad.photos) : []
    };
  }

  async create(data: any) {
    const { photos, ...rest } = data;
    return this.prisma.ad.create({
      data: {
        ...rest,
        photos: JSON.stringify(photos || [])
      }
    });
  }

  async update(id: number, data: any) {
    const { photos, ...rest } = data;
    const updateData: any = { ...rest };
    
    if (photos !== undefined) {
      if (Array.isArray(photos)) {
        updateData.photos = JSON.stringify(photos);
      } else if (typeof photos === 'string') {
        // Fallback: If it's a string, see if it's JSON or just a URL
        try {
          const parsed = JSON.parse(photos);
          updateData.photos = Array.isArray(parsed) ? photos : JSON.stringify([photos]);
        } catch {
          updateData.photos = JSON.stringify([photos]);
        }
      }
    }
    
    return this.prisma.ad.update({ where: { id }, data: updateData });
  }

  async remove(id: number) {
    return this.prisma.ad.delete({ where: { id } });
  }

  async incrementView(id: any) {
    const bigIntId = BigInt(id);
    await this.prisma.ad.update({ where: { id: bigIntId }, data: { viewCount: { increment: 1 } } });
  }
}
