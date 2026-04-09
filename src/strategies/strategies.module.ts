import { Module } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { StrategiesController } from './strategies.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StrategiesController],
  providers: [StrategiesService, PrismaService],
})
export class StrategiesModule {}
