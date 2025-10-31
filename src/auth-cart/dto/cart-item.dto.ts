import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CartItemDto {
  @ApiProperty({ description: 'UUID Товара', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Количество для добавления/обновления', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
