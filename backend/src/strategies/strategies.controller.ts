import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { StrategiesService } from './strategies.service';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Get()
  findAll() {
    return this.strategiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.strategiesService.findOne(+id);
  }

  @Post()
  create(@Body() createStrategyDto: any) {
    return this.strategiesService.create(createStrategyDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStrategyDto: any) {
    return this.strategiesService.update(+id, updateStrategyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.strategiesService.remove(+id);
  }
}
