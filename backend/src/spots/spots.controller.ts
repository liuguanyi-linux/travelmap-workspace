import { Controller, Get, Post, Body, Put, Param, Delete, Query, Patch } from '@nestjs/common';
import { SpotsService } from './spots.service';

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
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    console.log(`--- 收到状态更新请求 ---`, { id, isActive });
    if (!id) {
        throw new Error('Invalid request param: id is required');
    }
    return this.spotsService.updateStatus(id, isActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spotsService.findOne(+id);
  }

  @Post()
  create(@Body() createSpotDto: any) {
    return this.spotsService.create(createSpotDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSpotDto: any) {
    return this.spotsService.update(+id, updateSpotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spotsService.remove(+id);
  }
}
