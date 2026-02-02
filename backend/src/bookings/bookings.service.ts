import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.BookingCreateInput) {
    return this.prisma.booking.create({ data });
  }

  findAll(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { poi: true },
    });
  }
}
