import { Module } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { BoilerPartsController } from './boiler-parts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoilerPartsController],
  providers: [BoilerPartsService],
})
export class BoilerPartsModule {}
