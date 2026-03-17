import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false) {
    const where = includeExpired ? {} : {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };
    const guides = await this.prisma.guide.findMany({ 
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        hasCar: true,
        title: true,
        avatar: true,
        intro: true,
        cities: true,
        rank: true,
        isTop: true,
        isGlobal: true,
        category: true,
        photos: true,
        expiryDate: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isTop: 'desc' }, // Top items first
        { rank: 'asc' },   // Lower rank number = higher priority
        { createdAt: 'desc' }
      ]
    });
    return guides.map(g => this.transform(g));
  }

  async findOne(id: number) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) return null;
    return {
      ...guide,
      cities: JSON.parse(guide.cities),
      photos: guide.photos ? JSON.parse(guide.photos) : []
    };
  }

  async create(data: any) {
    const { cities, photos, reviews, ...rest } = data;
    const guide = await this.prisma.guide.create({
      data: {
        ...rest,
        cities: JSON.stringify(cities || []),
        photos: JSON.stringify(photos || [])
      }
    });
    return this.transform(guide);
  }

  async update(id: number, data: any) {
    const { cities, photos, reviews, ...rest } = data;
    const updateData: any = { ...rest };
    if (cities !== undefined) updateData.cities = JSON.stringify(cities);
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);

    const guide = await this.prisma.guide.update({
      where: { id },
      data: updateData
    });
    return this.transform(guide);
  }

  async remove(id: number) {
    return this.prisma.guide.delete({ where: { id } });
  }

  private transform(guide: any) {
    return {
      ...guide,
      cities: JSON.parse(guide.cities),
      photos: guide.photos ? JSON.parse(guide.photos) : []
    };
  }
}
