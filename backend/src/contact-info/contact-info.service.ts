import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async find() {
    const info = await this.prisma.contactInfo.findFirst();
    if (!info) {
        return {
            phone: '',
            email: '',
            wechat: '',
            website: '',
            address: ''
        };
    }
    return info;
  }

  async update(data: any) {
    const info = await this.prisma.contactInfo.findFirst();
    if (info) {
      return this.prisma.contactInfo.update({
        where: { id: info.id },
        data
      });
    } else {
      return this.prisma.contactInfo.create({
        data
      });
    }
  }
}
