import { Module } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { SpotsController } from './spots.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpotsController],
  providers: [SpotsService, PrismaService],
})
export class SpotsModule {}
