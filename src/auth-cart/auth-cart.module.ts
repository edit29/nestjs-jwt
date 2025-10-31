import { Module } from '@nestjs/common';
import { AuthCartService } from './auth-cart.service';
import { AuthCartController } from './auth-cart.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberModule } from 'src/article-number/article-number.module';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  imports: [PrismaModule, BoilerPartsModule, ArticleNumberModule],
  controllers: [AuthCartController],
  providers: [AuthCartService, PrismaService, BoilerPartsService, ArticleNumberService],
})
export class AuthCartModule {}
