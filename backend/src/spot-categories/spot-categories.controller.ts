import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { SpotCategoriesService } from './spot-categories.service';

@Controller('spot-categories')
export class SpotCategoriesController {
  constructor(private readonly spotCategoriesService: SpotCategoriesService) {}

  @Get()
  findAll() {
    return this.spotCategoriesService.findAll();
  }

  @Post()
  create(@Body() data: { name: string; key: string; icon: string; sortOrder?: number }) {
    return this.spotCategoriesService.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: { name?: string; key?: string; icon?: string; sortOrder?: number }) {
    return this.spotCategoriesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.spotCategoriesService.remove(id);
  }
}
