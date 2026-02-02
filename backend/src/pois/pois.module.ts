import { Module } from '@nestjs/common';
import { PoisController } from './pois.controller';
import { PoisService } from './pois.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PoisController],
  providers: [PoisService, PrismaService]
})
export class PoisModule {}
