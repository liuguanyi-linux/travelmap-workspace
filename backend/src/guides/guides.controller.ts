import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { GuidesService } from './guides.service';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  findAll() {
    return this.guidesService.findAll();
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
