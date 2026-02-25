import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  findAll(@Query('includeExpired') includeExpired: string) {
    return this.spotsService.findAll(includeExpired === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spotsService.findOne(+id);
  }

  @Post()
  create(@Body() createSpotDto: any) {
    return this.spotsService.create(createSpotDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSpotDto: any) {
    return this.spotsService.update(+id, updateSpotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spotsService.remove(+id);
  }
}
