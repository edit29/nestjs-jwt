import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BoilerPartsModule } from './boiler-parts/boiler-parts.module';
import { AuthModule } from './auth/auth.module';
import { ShoppingModule } from './product/shopping-cart.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ArticleNumberModule } from './article-number/article-number.module';
import { AuthCartModule } from './auth-cart/auth-cart.module';
import { CartCheckoutModule } from './cart-checkout/cart-checkout.module';

@Module({
  imports: 
  [
    ConfigModule.forRoot({
      isGlobal: true,
  }), 
  PrismaModule,
  ShoppingModule,
  BoilerPartsModule,
  AuthModule,
  ArticleNumberModule,
  AuthCartModule,
  CartCheckoutModule,
],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
