import { Module } from '@nestjs/common';
import { PhoneAuthService } from './phone-auth.service';
import { PhoneAuthController } from './phone-auth.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { ArticleNumberModule } from 'src/article-number/article-number.module';

@Module({
  imports: [PrismaModule, BoilerPartsModule, ArticleNumberModule, AuthModule],
  controllers: [PhoneAuthController],
  providers: [PhoneAuthService],
})
export class PhoneAuthModule {}
