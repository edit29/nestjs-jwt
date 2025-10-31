import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CheckoutDto {
  // @ApiProperty({ description: 'Telegram username to send the product card (e.g. @username or username)', example: '@example_user' })
  // @IsString()
  // telegramUsername: string;

  @ApiProperty({ description: 'Optional message to include with the product card', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
