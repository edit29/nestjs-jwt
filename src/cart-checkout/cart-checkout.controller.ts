import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CartCheckoutService } from './cart-checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly cartCheckoutService: CartCheckoutService) {}

  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({ summary: 'Оформите заказ и отправьте карточку товара через Telegram' })
  @ApiResponse({ status: 200, description: 'Создан заказ и отправлено сообщение в Telegram' })
  checkout(@Authorized('id') userId: string, @Body() dto: CheckoutDto) {
    return this.cartCheckoutService.checkout(userId, dto);
  }
}
