import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsageGuidesService } from './usage-guides.service';
import { CreateUsageGuideDto } from './dto/create-usage-guide.dto';
import { UpdateUsageGuideDto } from './dto/update-usage-guide.dto';

@Controller('usage-guides')
export class UsageGuidesController {
  constructor(private readonly usageGuidesService: UsageGuidesService) {}

  @Post()
  create(@Body() createUsageGuideDto: CreateUsageGuideDto) {
    return this.usageGuidesService.create(createUsageGuideDto);
  }

  @Get()
  findAll() {
    return this.usageGuidesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usageGuidesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsageGuideDto: UpdateUsageGuideDto) {
    return this.usageGuidesService.update(+id, updateUsageGuideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usageGuidesService.remove(+id);
  }
}
