import { Module } from '@nestjs/common';
import { SpotCategoriesService } from './spot-categories.service';
import { SpotCategoriesController } from './spot-categories.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpotCategoriesController],
  providers: [SpotCategoriesService, PrismaService],
  exports: [SpotCategoriesService],
})
export class SpotCategoriesModule {}
