import os

# Create directory
os.makedirs('src/reviews', exist_ok=True)

# 1. reviews.service.ts
service_content = """import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({
      data,
      include: { user: true, poi: true }
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { poi: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllByPoiId(poiId: number) {
    return this.prisma.review.findMany({
      where: { poiId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
"""
with open('src/reviews/reviews.service.ts', 'w', encoding='utf-8') as f:
    f.write(service_content)

# 2. reviews.controller.ts
controller_content = """import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
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
"""
with open('src/reviews/reviews.controller.ts', 'w', encoding='utf-8') as f:
    f.write(controller_content)

# 3. reviews.module.ts
module_content = """import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService],
})
export class ReviewsModule {}
"""
with open('src/reviews/reviews.module.ts', 'w', encoding='utf-8') as f:
    f.write(module_content)

# 4. Register in app.module.ts
app_module_path = 'src/app.module.ts'
with open(app_module_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'ReviewsModule' not in content:
    content = content.replace("import { BookingsModule } from './bookings/bookings.module';", 
                              "import { BookingsModule } from './bookings/bookings.module';\nimport { ReviewsModule } from './reviews/reviews.module';")
    content = content.replace("imports: [PoisModule, FavoritesModule, BookingsModule],",
                              "imports: [PoisModule, FavoritesModule, BookingsModule, ReviewsModule],")
    
    with open(app_module_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reviews module created and registered.")
