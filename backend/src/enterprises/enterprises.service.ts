import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EnterprisesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.enterprise.findMany({ orderBy: [{ isTop: 'desc' }, { rank: 'asc' }, { createdAt: 'desc' }] });
  }

  findOne(id: number) {
    return this.prisma.enterprise.findUnique({ where: { id: BigInt(id) } });
  }

  create(data: any) {
    const { id, photos, ...rest } = data;
    return this.prisma.enterprise.create({
      data: {
        ...rest,
        id: BigInt(Date.now()),
        photos: Array.isArray(photos) ? JSON.stringify(photos) : (photos || null),
      }
    });
  }

  update(id: number, data: any) {
    const { id: _id, photos, ...rest } = data;
    const updateData: any = { ...rest };
    if (photos !== undefined) {
      updateData.photos = Array.isArray(photos) ? JSON.stringify(photos) : (photos || null);
    }
    return this.prisma.enterprise.update({ where: { id: BigInt(id) }, data: updateData });
  }

  remove(id: number) {
    return this.prisma.enterprise.delete({ where: { id: BigInt(id) } });
  }

  async incrementView(id: any) {
    await this.prisma.enterprise.update({ where: { id: BigInt(id) }, data: { viewCount: { increment: 1 } } });
  }
}
