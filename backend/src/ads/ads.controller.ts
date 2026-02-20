import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { AdsService } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  findAll() {
    return this.adsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(+id);
  }

  @Post()
  create(@Body() createAdDto: any) {
    return this.adsService.create(createAdDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAdDto: any) {
    return this.adsService.update(+id, updateAdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(+id);
  }
}
