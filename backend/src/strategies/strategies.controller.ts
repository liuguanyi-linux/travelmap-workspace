import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { StrategiesService } from './strategies.service';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Get()
  findAll(@Query('includeExpired') includeExpired: string) {
    return this.strategiesService.findAll(includeExpired === 'true');
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
