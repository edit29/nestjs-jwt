import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Response } from 'express';
import type { Request } from 'express';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponse } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Authorization } from './decorators/auth.decorator';
import { Authorized } from './decorators/authorized.decorator';
import type { User } from '@prisma/client';

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

  @Authorization()
  @Get('@me')
  @HttpCode(HttpStatus.OK)
  async me(@Authorized('id') id: User){
    return {id};
  }
}
