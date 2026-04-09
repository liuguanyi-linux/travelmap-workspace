import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { UpdateGuideDto } from './dto/update-guide.dto/update-guide.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  findAll(@Query('includeExpired') includeExpired: string) {
    return this.guidesService.findAll(includeExpired === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guidesService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createGuideDto: any) {
    return this.guidesService.create(createGuideDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateGuideDto: UpdateGuideDto) {
    return this.guidesService.update(id, updateGuideDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.guidesService.remove(id);
  }

  @Post(':id/view')
  @HttpCode(200)
  incrementView(@Param('id') id: string) {
    return this.guidesService.incrementView(id);
  }
}
