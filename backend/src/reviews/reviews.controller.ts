import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() data: Prisma.ReviewUncheckedCreateInput) {
    return this.reviewsService.create(data);
  }

  @Post('amap')
  async createForAmap(@Body() data: { 
    userId: number, 
    amapId: string, 
    poiName: string, 
    poiType: string, 
    poiAddress?: string,
    rating: number, 
    content: string 
  }) {
    return this.reviewsService.createForAmap(data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.delete(id);
  }

  @Get('amap/:amapId')
  async findAllByAmapId(@Param('amapId') amapId: string) {
    return this.reviewsService.findAllByAmapId(amapId);
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.findAllByUserId(userId);
  }

  @Get('poi/:poiId')
  async findAllByPoiId(@Param('poiId', ParseIntPipe) poiId: number) {
    return this.reviewsService.findAllByPoiId(poiId);
  }

  @Get('spot/:spotId')
  async findAllBySpotId(@Param('spotId', ParseIntPipe) spotId: number) {
    return this.reviewsService.findAllBySpotId(spotId);
  }

  @Get('guide/:guideId')
  async findAllByGuideId(@Param('guideId', ParseIntPipe) guideId: number) {
    return this.reviewsService.findAllByGuideId(guideId);
  }

  @Get('strategy/:strategyId')
  async findAllByStrategyId(@Param('strategyId', ParseIntPipe) strategyId: number) {
    return this.reviewsService.findAllByStrategyId(strategyId);
  }
}
