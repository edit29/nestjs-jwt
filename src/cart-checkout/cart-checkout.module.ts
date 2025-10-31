import { Module } from '@nestjs/common';
import { CartCheckoutService } from './cart-checkout.service';
import { CheckoutController } from './cart-checkout.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberModule } from 'src/article-number/article-number.module';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { NotificationService } from '../notification/notification.service';


@Module({
  imports: [PrismaModule, BoilerPartsModule, ArticleNumberModule],
  controllers: [CheckoutController],
  providers: [CartCheckoutService, BoilerPartsService, ArticleNumberService, NotificationService],
})
export class CartCheckoutModule {}
