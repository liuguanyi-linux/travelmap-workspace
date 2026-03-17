import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ReviewUncheckedCreateInput & { isAdmin?: boolean, customNickname?: string }) {
    const { isAdmin, customNickname, ...rest } = data;
    const reviewData = rest as any;
    
    // Ensure at least one target is present
    if (!reviewData.poiId && !reviewData.spotId && !reviewData.guideId && !reviewData.strategyId) {
        throw new Error('Review must be associated with a target (POI, Spot, Guide, or Strategy)');
    }

    // Handle Admin/Custom Reviews without real users
    if (isAdmin || customNickname) {
        reviewData.type = 'ADMIN_MOCK';
        reviewData.customNickname = customNickname;
        if (!reviewData.userId) {
            reviewData.userId = 1; // Default to Admin
        }
    } else {
        reviewData.type = 'REAL';
    }

    return this.prisma.review.create({
      data: reviewData,
      include: { user: true }
    });
  }

  async batchGenerate(targetType: string, targetId: number | string) {
    const numericId = Number(targetId);
    if (isNaN(numericId)) throw new Error('Invalid target ID');

    const mockNames = ['여행매니아', '맛집탐험가', '가족여행객', '힐링원해', '현지인추천'];
    const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 reviews

    const reviews: any[] = [];
    for (let i = 0; i < count; i++) {
      const data: any = {
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        content: '정말 좋았어요! 강력 추천합니다.', // generic good review
        type: 'SYSTEM_MOCK',
        customNickname: mockNames[i % mockNames.length],
        userId: 1, // bind to admin
      };
      data[`${targetType}Id`] = numericId;

      const review = await this.prisma.review.create({ data });
      reviews.push(review);
    }
    return reviews;
  }

  async batchClear(targetType: string, targetId: number | string) {
    const numericId = Number(targetId);
    if (isNaN(numericId)) throw new Error('Invalid target ID');

    const where: any = {
      type: 'SYSTEM_MOCK'
    };
    where[`${targetType}Id`] = numericId;

    return this.prisma.review.deleteMany({
      where
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { poi: true, spot: true, guide: true, strategy: true },
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

  async findAllBySpotId(spotId: number) {
    return this.prisma.review.findMany({
      where: { spotId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllByGuideId(guideId: number) {
    return this.prisma.review.findMany({
      where: { guideId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllByStrategyId(strategyId: number) {
    return this.prisma.review.findMany({
      where: { strategyId },
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
