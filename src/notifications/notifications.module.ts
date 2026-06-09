import { forwardRef, Module } from '@nestjs/common'

import { NotificationRepository } from '../common/repositories/notification.repository'
import { SocketModule } from '../socket/socket.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [forwardRef(() => SocketModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
