import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({
      data,
      include: { user: true, poi: true }
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { poi: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllByPoiId(poiId: number) {
    return this.prisma.review.findMany({
      where: { poiId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllByAmapId(amapId: string) {
    const poi = await this.prisma.poi.findUnique({
      where: { amapId },
    });
    
    if (!poi) return [];

    return this.prisma.review.findMany({
      where: { poiId: poi.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createForAmap(data: { 
    userId: number, 
    amapId: string, 
    poiName: string, 
    poiType: string, 
    poiAddress?: string,
    rating: number, 
    content: string 
  }) {
    // 1. Find or create POI
    let poi = await this.prisma.poi.findUnique({
      where: { amapId: data.amapId },
    });

    if (!poi) {
      poi = await this.prisma.poi.create({
        data: {
          amapId: data.amapId,
          name: data.poiName,
          type: data.poiType,
          address: data.poiAddress,
        }
      });
    }

    // 2. Create review
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        poiId: poi.id,
        rating: data.rating,
        content: data.content,
      },
      include: { user: true }
    });
  }

  async delete(id: number) {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
