import { Controller, Get, HttpCode, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  findAll(@Query('includeExpired') includeExpired: string) {
    return this.adsService.findAll(includeExpired === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createAdDto: any) {
    return this.adsService.create(createAdDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateAdDto: any) {
    return this.adsService.update(+id, updateAdDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.adsService.remove(+id);
  }

  @Post(':id/view')
  @HttpCode(200)
  incrementView(@Param('id') id: string) {
    return this.adsService.incrementView(id);
  }
}
