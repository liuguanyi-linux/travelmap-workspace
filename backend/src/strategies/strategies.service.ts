import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StrategiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const strategies = await this.prisma.strategy.findMany();
    return strategies.map(s => ({
      ...s,
      spots: JSON.parse(s.spots),
      tags: JSON.parse(s.tags),
      photos: s.photos ? JSON.parse(s.photos) : [],
      videos: s.videos ? JSON.parse(s.videos) : []
    }));
  }

  async findOne(id: number) {
    const strategy = await this.prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return null;
    return {
      ...strategy,
      spots: JSON.parse(strategy.spots),
      tags: JSON.parse(strategy.tags),
      photos: strategy.photos ? JSON.parse(strategy.photos) : [],
      videos: strategy.videos ? JSON.parse(strategy.videos) : []
    };
  }

  async create(data: any) {
    const { spots, tags, photos, videos, reviews, ...rest } = data;
    const strategy = await this.prisma.strategy.create({
      data: {
        ...rest,
        spots: JSON.stringify(spots || []),
        tags: JSON.stringify(tags || []),
        photos: JSON.stringify(photos || []),
        videos: JSON.stringify(videos || [])
      }
    });
    return this.transform(strategy);
  }

  async update(id: number, data: any) {
    const { spots, tags, photos, videos, reviews, ...rest } = data;
    const updateData: any = { ...rest };
    if (spots !== undefined) updateData.spots = JSON.stringify(spots);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);
    if (videos !== undefined) updateData.videos = JSON.stringify(videos);

    const strategy = await this.prisma.strategy.update({
      where: { id },
      data: updateData
    });
    return this.transform(strategy);
  }

  async remove(id: number) {
    return this.prisma.strategy.delete({ where: { id } });
  }

  private transform(strategy: any) {
    return {
      ...strategy,
      spots: JSON.parse(strategy.spots),
      tags: JSON.parse(strategy.tags),
      photos: strategy.photos ? JSON.parse(strategy.photos) : [],
      videos: strategy.videos ? JSON.parse(strategy.videos) : []
    };
  }
}
