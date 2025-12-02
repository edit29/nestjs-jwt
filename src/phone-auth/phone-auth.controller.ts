import { Body, Controller, Post, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { PhoneAuthService } from './phone-auth.service';
import { SendCodeDto } from 'src/auth/dto/send-code.dto';
import { VerifyCodeDto } from 'src/auth/dto/verify-code.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import type { Response } from 'express';

@ApiTags('PhoneAuth')
@Controller('authg')
export class PhoneAuthController {
  constructor(private readonly phoneAuthService: PhoneAuthService, private readonly authService: AuthService) {}

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification code to phone' })
  async sendCode(@Body() dto: SendCodeDto) {
    return this.phoneAuthService.sendCode(dto.phone);
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone code and sign in / register' })
  @ApiResponse({ status: 200, description: 'Returns access token' })
  async verifyCode(@Res({ passthrough: true }) res: Response, @Body() dto: VerifyCodeDto) {
    const user = await this.phoneAuthService.verifyCode(dto.phone, dto.code);
    if (!user) return { success: false, message: 'Invalid or expired code' };

    // Update name if provided
    if (dto.name) {
      await (this.phoneAuthService as any).prisma.user.update({ where: { id: user.id }, data: { name: dto.name } });
    }

    return this.authService.authById(res, user.id);
  }
}
