import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoisModule } from './pois/pois.module';
import { FavoritesModule } from './favorites/favorites.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { GuidesModule } from './guides/guides.module';
import { StrategiesModule } from './strategies/strategies.module';
import { SpotsModule } from './spots/spots.module';
import { AdsModule } from './ads/ads.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { CitiesModule } from './cities/cities.module';
import { StrategyCategoriesModule } from './strategy-categories/strategy-categories.module';
import { SpotCategoriesModule } from './spot-categories/spot-categories.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PoisModule, FavoritesModule, BookingsModule, ReviewsModule, UsersModule, GuidesModule, StrategiesModule, SpotsModule, AdsModule, ContactInfoModule, CitiesModule, StrategyCategoriesModule, SpotCategoriesModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
