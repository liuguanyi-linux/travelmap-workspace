import { Controller, Get, Put, Body } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Get()
  find() {
    return this.contactInfoService.find();
  }

  @Put()
  update(@Body() updateContactInfoDto: any) {
    return this.contactInfoService.update(updateContactInfoDto);
  }
}
