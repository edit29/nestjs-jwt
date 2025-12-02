import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthController } from 'src/phone-auth/phone-auth.controller';
import { PhoneAuthService } from 'src/phone-auth/phone-auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    })
  ],
  controllers: [AuthController, PhoneAuthController],
  providers: [AuthService, JwtStrategy, PhoneAuthService],
  exports: [AuthService, JwtModule, PhoneAuthService]
})
export class AuthModule {}

