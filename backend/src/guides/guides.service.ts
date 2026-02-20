import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const guides = await this.prisma.guide.findMany();
    return guides.map(g => ({
      ...g,
      cities: JSON.parse(g.cities),
      photos: g.photos ? JSON.parse(g.photos) : []
    }));
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
