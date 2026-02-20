import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { StrategyCategoriesService } from './strategy-categories.service';

@Controller('strategy-categories')
export class StrategyCategoriesController {
  constructor(private readonly strategyCategoriesService: StrategyCategoriesService) {}

  @Get()
  findAll() {
    return this.strategyCategoriesService.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.strategyCategoriesService.create(name);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.strategyCategoriesService.remove(id);
  }
}
