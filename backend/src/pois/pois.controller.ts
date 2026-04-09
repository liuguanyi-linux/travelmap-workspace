import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PoisService } from './pois.service';
import { Prisma } from '@prisma/client';

@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updatePoiDto: Prisma.PoiUpdateInput) {
    return this.poisService.update(+id, updatePoiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poisService.remove(+id);
  }
}
