import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { GuidesService } from './guides.service';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  findAll(@Query('includeExpired') includeExpired: string) {
    return this.guidesService.findAll(includeExpired === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guidesService.findOne(+id);
  }

  @Post()
  create(@Body() createGuideDto: any) {
    return this.guidesService.create(createGuideDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGuideDto: any) {
    return this.guidesService.update(+id, updateGuideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guidesService.remove(+id);
  }
}
