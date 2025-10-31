import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthCartService } from './auth-cart.service';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CartItemDto } from '../auth-cart/dto/cart-item.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enum/roles.enum';

@ApiTags('Cart')
@Controller('cart')
export class AuthCartController {
  constructor(private readonly authCartService: AuthCartService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  @ApiResponse({ status: 200, description: 'Возвращает корзину пользователя' })
  getCart(@Authorized('id') userId: string) {
    return this.authCartService.getCart(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER) 
  @Post()
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  addToCart(@Authorized('id') userId: string, @Body() dto: CartItemDto) {
    return this.authCartService.addToCart(userId, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Put()
  @ApiOperation({ summary: 'Обновить количество товара в корзине' })
  updateCartItem(@Authorized('id') userId: string, @Body() dto: CartItemDto) {
    return this.authCartService.updateCartItem(userId, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER) 
  @Delete(':productId')
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  removeFromCart(@Authorized('id') userId: string, @Param('productId') productId: string) {
    return this.authCartService.removeFromCart(userId, productId);
  }
}
