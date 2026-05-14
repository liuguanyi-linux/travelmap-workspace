import { Module } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { AppSettingsController } from './app-settings.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AppSettingsController],
  providers: [AppSettingsService, PrismaService],
})
export class AppSettingsModule {}
