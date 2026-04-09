import { Controller, Get, HttpCode, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EnterprisesService } from './enterprises.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('enterprises')
export class EnterprisesController {
  constructor(private readonly service: EnterprisesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(+id, body); }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) { return this.service.remove(+id); }

  @Post(':id/view')
  @HttpCode(200)
  incrementView(@Param('id') id: string) {
    return this.service.incrementView(id);
  }
}
