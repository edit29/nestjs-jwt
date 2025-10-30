import { Module } from '@nestjs/common';
import { ShoppingService } from './shopping-cart.service';
import { ShoppingController } from './shopping-cart.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';

@Module({
  imports: [PrismaModule, BoilerPartsModule],
  controllers: [ShoppingController],
  providers: [ShoppingService, BoilerPartsService],
})
export class ShoppingModule {}
