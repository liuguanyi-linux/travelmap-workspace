import { Controller, Get, HttpCode, Post, Body, Put, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  findAll(
    @Query('includeExpired') includeExpired: string,
    @Query('includeInactive') includeInactive: string
  ) {
    return this.spotsService.findAll(includeExpired === 'true', includeInactive === 'true');
  }

  @Put(':id/status')
  @Patch(':id/status')
  @Post(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    if (!id) throw new Error('Invalid request param: id is required');
    return this.spotsService.updateStatus(id, isActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spotsService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createSpotDto: any) {
    return this.spotsService.create(createSpotDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateSpotDto: any) {
    return this.spotsService.update(+id, updateSpotDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.spotsService.remove(+id);
  }

  @Post(':id/view')
  @HttpCode(200)
  incrementView(@Param('id') id: string) {
    return this.spotsService.incrementView(id);
  }
}
