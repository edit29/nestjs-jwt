import { Module } from '@nestjs/common';
import { NotificationByTgPersonalService } from './notification-by-tg-personal.service';

@Module({
  providers: [NotificationByTgPersonalService],
  exports: [NotificationByTgPersonalService],
})
export class NotificationByTgPersonalModule {}