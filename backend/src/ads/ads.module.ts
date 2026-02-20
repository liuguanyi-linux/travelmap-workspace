import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdsController],
  providers: [AdsService, PrismaService],
})
export class AdsModule {}
