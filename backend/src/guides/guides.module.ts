import { Module } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GuidesController],
  providers: [GuidesService, PrismaService],
})
export class GuidesModule {}
