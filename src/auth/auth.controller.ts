import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Response } from 'express';
import type { Request } from 'express';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponse } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Authorization } from './decorators/auth.decorator';
import { Authorized } from './decorators/authorized.decorator';
import type { User } from '@prisma/client';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Создание аккаунта',
    description: "Создаёт новый акк пользователя"
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiBadRequestResponse({ description: 'Некорректные входные данные'})
  @ApiConflictResponse({ description: 'Пользователь с такой почтой уже существует', schema: { description: ''}})
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Res({passthrough: true}) res: Response, 
    @Body() dto:RegisterRequest){
    return await this.authService.register(res, dto);
  }

  @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify phone code and sign in / register' })
    @ApiResponse({ status: 200, description: 'Returns access token' })
    async verifyCode(@Res({ passthrough: true }) res: Response, @Body() dto: VerifyCodeDto) {
      const user = await this.authService.verifyCode(dto.phone, dto.code);
      if (!user) return { success: false, message: 'Invalid or expired code' };
  
      // Update name if provided
      if (dto.name) {
        await (this.authService as any).prisma.user.update({ where: { id: user.id }, data: { name: dto.name } });
      }
  
      return this.authService.authById(res, user.id);
    }

    @Post('telegram')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login or register with Telegram Login Widget' })
    @ApiBody({ description: 'Telegram login payload as received from widget (id, first_name, username, auth_date, hash, ...)' })
    async telegramLogin(@Res({ passthrough: true }) res: Response, @Body() dto: Record<string, any>){
      return this.authService.telegramLogin(res, dto);
    }

  
  @ApiOperation({
    summary: 'Вход в аккаунт',
    description: "Входит в акк пользователя и выдает токен доступа"
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiBadRequestResponse({ description: 'Некорректные входные данные'})
  @ApiNotFoundResponse({ description: 'Пользователь не найден'})
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({passthrough: true}) res: Response, 
    @Body() dto: LoginRequest){
    return await this.authService.login(res, dto);
  }

  @ApiOperation({
    summary: 'Обновление токена',
    description: "Генерирует новый токен доступа"
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiUnauthorizedResponse({ description: "Недействительный refresh token"})
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response){
    return await this.authService.refresh(req, res);
  }
  
  @ApiOperation({
    summary: 'Выход из аккаунта',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({passthrough: true}) res: Response){
    return await this.authService.logout(res);
  }

  @ApiOperation({
    summary: 'Получение собственного id',
    description: "Возвращает пользователю его id"
  })
  @Authorization()
  @Get('@me')
  @HttpCode(HttpStatus.OK)
  async me(@Authorized('id') id: User){
    return {id};
  }
}
