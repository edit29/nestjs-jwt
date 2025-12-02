import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { BitrixController } from './bitrix.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

@Module({
  controllers: [BitrixController],
  providers: [BitrixService],
})
export class BitrixModule {}
