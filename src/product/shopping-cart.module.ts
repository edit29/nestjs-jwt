import { Module } from '@nestjs/common';
import { ShoppingService } from './shopping-cart.service';
import { ShoppingController } from './shopping-cart.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberModule } from 'src/article-number/article-number.module';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { NotificationService } from '../notification/byTelegramBot/notification.service';

@Module({
  imports: [PrismaModule, BoilerPartsModule, ArticleNumberModule],
  controllers: [ShoppingController],
  providers: [ShoppingService, BoilerPartsService, ArticleNumberService, NotificationService],
})
export class ShoppingModule {}
