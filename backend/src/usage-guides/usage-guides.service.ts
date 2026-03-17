import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsageGuideDto } from './dto/create-usage-guide.dto';
import { UpdateUsageGuideDto } from './dto/update-usage-guide.dto';

@Injectable()
export class UsageGuidesService {
  constructor(private prisma: PrismaService) {}

  create(createUsageGuideDto: CreateUsageGuideDto) {
    return this.prisma.usageGuide.create({
      data: createUsageGuideDto,
    });
  }

  findAll() {
    return this.prisma.usageGuide.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.usageGuide.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUsageGuideDto: UpdateUsageGuideDto) {
    return this.prisma.usageGuide.update({
      where: { id },
      data: updateUsageGuideDto,
    });
  }

  remove(id: number) {
    return this.prisma.usageGuide.delete({
      where: { id },
    });
  }
}
