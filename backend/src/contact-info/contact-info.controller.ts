import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Get()
  find() {
    return this.contactInfoService.find();
  }

  @Put()
  @UseGuards(AdminGuard)
  update(@Body() updateContactInfoDto: any) {
    return this.contactInfoService.update(updateContactInfoDto);
  }
}
