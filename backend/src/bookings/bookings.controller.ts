import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: any) {
     const { userId, poiId, date, guests } = createBookingDto;
     if (!userId || !poiId || !date) {
       throw new BadRequestException('userId, poiId, date are required');
     }
     return this.bookingsService.create({
        user: { connect: { id: userId } },
        poi: { connect: { id: poiId } },
        date: new Date(date),
        guests: guests || 1,
     });
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.bookingsService.findAll(+userId);
  }
}
