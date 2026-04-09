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
    const { id, ...rest } = data;
    return this.prisma.enterprise.create({ data: { ...rest, id: id ? BigInt(id) : undefined } });
  }

  update(id: number, data: any) {
    const { id: _id, ...rest } = data;
    return this.prisma.enterprise.update({ where: { id: BigInt(id) }, data: rest });
  }

  remove(id: number) {
    return this.prisma.enterprise.delete({ where: { id: BigInt(id) } });
  }
}
