import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({ description: 'Phone number in international format', example: '+71234567890' })
  @IsString()
  phone: string;
}
