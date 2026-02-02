import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: number, poiId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_poiId: { userId, poiId },
      },
    });

    if (existing) {
      return this.prisma.favorite.delete({
        where: { id: existing.id },
      });
    }

    return this.prisma.favorite.create({
      data: { userId, poiId },
    });
  }

  findAll(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { poi: true },
    });
  }
}
