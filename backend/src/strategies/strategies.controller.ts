import { Controller, Get, HttpCode, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { UpdateStrategyDto } from './dto/update-strategy.dto/update-strategy.dto';
import { AdminGuard } from '../auth/admin.guard';

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
  @UseGuards(AdminGuard)
  create(@Body() createStrategyDto: any) {
    return this.strategiesService.create(createStrategyDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateStrategyDto: UpdateStrategyDto) {
    return this.strategiesService.update(id, updateStrategyDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.strategiesService.remove(id);
  }

  @Post(':id/view')
  @HttpCode(200)
  incrementView(@Param('id') id: string) {
    return this.strategiesService.incrementView(id);
  }
}
