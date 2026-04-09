import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StrategyCategoriesService } from './strategy-categories.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('strategy-categories')
export class StrategyCategoriesController {
  constructor(private readonly strategyCategoriesService: StrategyCategoriesService) {}

  @Get()
  findAll() {
    return this.strategyCategoriesService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body('name') name: string) {
    return this.strategyCategoriesService.create(name);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.strategyCategoriesService.remove(id);
  }
}
