import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false) {
    const where = includeExpired ? {} : {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };
    const spots = await this.prisma.spot.findMany({ where });
    return spots.map(s => this.transform(s));
  }

  async findOne(id: number) {
    const spot = await this.prisma.spot.findUnique({ where: { id } });
    if (!spot) return null;
    return this.transform(spot);
  }

  async create(data: any) {
    const { tags, photos, reviews, location, lng, lat, videos, ...rest } = data;
    const finalLng = location?.lng ?? lng;
    const finalLat = location?.lat ?? lat;
    const serialize = (val: any) => {
      const result = typeof val === 'string' ? val : JSON.stringify(val || []);
      return result;
    };

    const spot = await this.prisma.spot.create({
      data: {
        ...rest,
        tags: serialize(tags),
        photos: serialize(photos),
        lng: finalLng,
        lat: finalLat
      }
    });
    return this.transform(spot);
  }

  async update(id: number, data: any) {
    const { tags, photos, reviews, location, lng, lat, videos, ...rest } = data;
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
      where: { id },
      data: updateData
    });
    return this.transform(spot);
  }

  async remove(id: number) {
    return this.prisma.spot.delete({ where: { id } });
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
      tags: parseJSON(spot.tags),
      photos: parseJSON(spot.photos),
      reviews: [], // Legacy compatibility
      location: (spot.lng && spot.lat) ? { lng: spot.lng, lat: spot.lat } : undefined
    };
  }
}
