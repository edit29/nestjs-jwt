import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ description: 'Phone number used to request the code', example: '+71234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Verification code sent to the phone', example: '123456' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Optional display name for new user', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
