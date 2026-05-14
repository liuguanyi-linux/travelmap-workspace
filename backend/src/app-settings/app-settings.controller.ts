import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly svc: AppSettingsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Put()
  @UseGuards(AdminGuard)
  async update(@Body() body: Record<string, string>) {
    for (const [k, v] of Object.entries(body || {})) {
      if (typeof v === 'string') await this.svc.upsert(k, v);
    }
    return this.svc.findAll();
  }
}
