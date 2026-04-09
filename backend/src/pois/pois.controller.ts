import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PoisService } from './pois.service';
import { Prisma } from '@prisma/client';
import { AdminGuard } from '../auth/admin.guard';

@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createPoiDto: Prisma.PoiCreateInput) {
    return this.poisService.create(createPoiDto);
  }

  @Get()
  findAll() {
    return this.poisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poisService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updatePoiDto: Prisma.PoiUpdateInput) {
    return this.poisService.update(+id, updatePoiDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.poisService.remove(+id);
  }
}
