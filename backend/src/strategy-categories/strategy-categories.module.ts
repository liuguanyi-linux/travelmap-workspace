import { Module } from '@nestjs/common';
import { StrategyCategoriesService } from './strategy-categories.service';
import { StrategyCategoriesController } from './strategy-categories.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StrategyCategoriesController],
  providers: [StrategyCategoriesService, PrismaService],
})
export class StrategyCategoriesModule {}
