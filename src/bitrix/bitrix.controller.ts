import { Controller, Post, Body, Headers, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { BitrixService } from './bitrix.service';

@Controller('bitrix')
export class BitrixController {
  constructor(private readonly bitrixService: BitrixService) {}

  // Generic webhook endpoint Bitrix can call when a product is created/updated.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any, @Headers('x-bitrix-signature') signature?: string) {
    // Simple security: check a shared secret in header or query param
    const expected = process.env.BITRIX_SECRET;
    const provided = signature ?? body?.secret;
    if (expected && provided !== expected) {
      throw new ForbiddenException('Invalid Bitrix secret');
    }

    // Bitrix may send different shapes; delegate to service
    const result = await this.bitrixService.handleProductUpdate(body);
    return result;
  }
}
