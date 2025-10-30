import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BoilerPartsModule } from './boiler-parts/boiler-parts.module';
import { AuthModule } from './auth/auth.module';
import { ShoppingModule } from './product/shopping-cart.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ShoppingService } from './product/shopping-cart.service';

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
],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
