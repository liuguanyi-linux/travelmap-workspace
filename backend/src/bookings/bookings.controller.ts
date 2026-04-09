import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: any) {
     const { userId, poiId, date, guests } = createBookingDto;
     return this.bookingsService.create({
        user: { connect: { id: userId } },
        poi: { connect: { id: poiId } },
        date: new Date(date),
        guests,
     });
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.bookingsService.findAll(+userId);
  }
}
