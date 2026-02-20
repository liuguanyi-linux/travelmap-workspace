import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StrategyCategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.strategyCategory.findMany();
  }

  create(name: string) {
    return this.prisma.strategyCategory.create({
      data: { name },
    });
  }

  remove(id: number) {
    return this.prisma.strategyCategory.delete({
      where: { id },
    });
  }
}
