import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PoisService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PoiCreateInput) {
    const existing = await this.prisma.poi.findUnique({
      where: { amapId: data.amapId },
    });
    if (existing) {
        return this.prisma.poi.update({
            where: { id: existing.id },
            data,
        });
    }
    return this.prisma.poi.create({ data });
  }

  findAll() {
    return this.prisma.poi.findMany();
  }

  findOne(id: number) {
    return this.prisma.poi.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.PoiUpdateInput) {
    return this.prisma.poi.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.poi.delete({ where: { id } });
  }
}
