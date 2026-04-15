import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: number, targetId: string | number, type: 'poi' | 'strategy' | 'enterprise', itemData?: any) {
    try {
      if (type === 'poi') {
        const amapKey = String(targetId);
        let poi = await this.prisma.poi.findFirst({ where: { amapId: amapKey } });

        if (!poi && itemData) {
          poi = await this.prisma.poi.create({
            data: {
              amapId: amapKey,
              name: itemData.name || 'Unknown POI',
              type: itemData.type || 'spot',
              address: itemData.address || '',
              photos: itemData.imageUrl ? JSON.stringify([itemData.imageUrl]) : undefined
            }
          });
        } else if (!poi) {
          throw new HttpException('POI not found and no item data provided for auto-creation.', HttpStatus.BAD_REQUEST);
        }
        const poiId = poi.id;

        const existing = await this.prisma.favorite.findFirst({
          where: { userId, poiId },
        });

        if (existing) {
          return await this.prisma.favorite.delete({
            where: { id: existing.id },
          });
        }

        return await this.prisma.favorite.create({
          data: { userId, poiId },
        });
      } else if (type === 'strategy') {
        const strategyId = BigInt(targetId);
        const existing = await this.prisma.favorite.findFirst({
          where: { userId, strategyId },
        });

        if (existing) {
          return await this.prisma.favorite.delete({
            where: { id: existing.id },
          });
        }

        return await this.prisma.favorite.create({
          data: { userId, strategyId },
        });
      } else if (type === 'enterprise') {
        const enterpriseId = BigInt(targetId);
        const existing = await this.prisma.favorite.findFirst({
          where: { userId, enterpriseId },
        });

        if (existing) {
          return await this.prisma.favorite.delete({
            where: { id: existing.id },
          });
        }

        return await this.prisma.favorite.create({
          data: { userId, enterpriseId },
        });
      }
    } catch (error: any) {
      console.error("🔥 [Backend] FavoritesService toggle error:", error);
      // Ensure we throw a clean HttpException to the controller
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal Server Error during toggle', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { 
        poi: true,
        strategy: true,
        enterprise: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fix BigInt serialization issue by mapping and converting to string
    return favorites.map(fav => ({
      ...fav,
      strategyId: fav.strategyId ? fav.strategyId.toString() : null,
      strategy: fav.strategy ? {
        ...fav.strategy,
        id: fav.strategy.id.toString()
      } : null
    }));
  }
}
