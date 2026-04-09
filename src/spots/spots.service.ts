import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const spots = await this.prisma.spot.findMany();
    return spots.map(s => ({
      ...s,
      tags: JSON.parse(s.tags),
      photos: s.photos ? JSON.parse(s.photos) : [],
      videos: s.videos ? JSON.parse(s.videos) : [],
      location: (s.lng && s.lat) ? { lng: s.lng, lat: s.lat } : undefined
    }));
  }

  async findOne(id: number) {
    const spot = await this.prisma.spot.findUnique({ where: { id } });
    if (!spot) return null;
    return {
      ...spot,
      tags: JSON.parse(spot.tags),
      photos: spot.photos ? JSON.parse(spot.photos) : [],
      videos: spot.videos ? JSON.parse(spot.videos) : [],
      location: (spot.lng && spot.lat) ? { lng: spot.lng, lat: spot.lat } : undefined
    };
  }

  async create(data: any) {
    const { tags, photos, videos, location, ...rest } = data;
    return this.prisma.spot.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags || []),
        photos: JSON.stringify(photos || []),
        videos: JSON.stringify(videos || []),
        lng: location?.lng,
        lat: location?.lat
      }
    });
  }

  async update(id: number, data: any) {
    const { tags, photos, videos, location, ...rest } = data;
    const updateData: any = { ...rest };
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);
    if (videos !== undefined) updateData.videos = JSON.stringify(videos);
    if (location !== undefined) {
      updateData.lng = location.lng;
      updateData.lat = location.lat;
    }

    return this.prisma.spot.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: number) {
    return this.prisma.spot.delete({ where: { id } });
  }
}
