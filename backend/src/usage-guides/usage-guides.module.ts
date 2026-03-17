import { Module } from '@nestjs/common';
import { UsageGuidesService } from './usage-guides.service';
import { UsageGuidesController } from './usage-guides.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [UsageGuidesController],
  providers: [UsageGuidesService, PrismaService],
})
export class UsageGuidesModule {}
