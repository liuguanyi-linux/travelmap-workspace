import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  toggle(@Body() body: { userId: number; poiId: number }) {
    return this.favoritesService.toggle(body.userId, body.poiId);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.favoritesService.findAll(+userId);
  }
}
