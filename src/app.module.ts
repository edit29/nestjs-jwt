import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BoilerPartsModule } from './boiler-parts/boiler-parts.module';
import { AuthModule } from './auth/auth.module';
import { ShoppingModule } from './product/shopping-cart.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ArticleNumberModule } from './article-number/article-number.module';
import { AuthCartModule } from './auth-cart/auth-cart.module';
import { CartCheckoutModule } from './cart-checkout/cart-checkout.module';
import { PhoneAuthModule } from './phone-auth/phone-auth.module';
import { BitrixModule } from './bitrix/bitrix.module';

@Module({
  imports: 
  [
    ConfigModule.forRoot({
      isGlobal: true,
  }), 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  PrismaModule,
  ShoppingModule,
  BoilerPartsModule,
  AuthModule,
  ArticleNumberModule,
  AuthCartModule,
  CartCheckoutModule,
  PhoneAuthModule,
  BitrixModule,
],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
