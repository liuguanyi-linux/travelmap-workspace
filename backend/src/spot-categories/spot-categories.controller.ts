import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { SpotCategoriesService } from './spot-categories.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('spot-categories')
export class SpotCategoriesController {
  constructor(private readonly spotCategoriesService: SpotCategoriesService) {}

  @Get()
  findAll() {
    return this.spotCategoriesService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() data: { name: string; key: string; icon: string; sortOrder?: number }) {
    return this.spotCategoriesService.create(data);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: { name?: string; key?: string; icon?: string; sortOrder?: number }) {
    return this.spotCategoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.spotCategoriesService.remove(id);
  }
}
