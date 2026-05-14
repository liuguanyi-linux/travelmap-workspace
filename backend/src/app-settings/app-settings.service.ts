import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppSettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.appSetting.findMany();
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    return obj;
  }

  async upsert(key: string, value: string) {
    return this.prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
