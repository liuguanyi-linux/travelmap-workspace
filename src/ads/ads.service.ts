import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ad.findMany();
  }

  async findOne(id: number) {
    return this.prisma.ad.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.ad.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.ad.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.ad.delete({ where: { id } });
  }
}
