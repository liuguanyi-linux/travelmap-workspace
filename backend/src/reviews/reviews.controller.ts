import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() data: Prisma.ReviewUncheckedCreateInput) {
    return this.reviewsService.create(data);
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.findAllByUserId(userId);
  }

  @Get('poi/:poiId')
  async findAllByPoiId(@Param('poiId', ParseIntPipe) poiId: number) {
    return this.reviewsService.findAllByPoiId(poiId);
  }
}
