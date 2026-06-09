import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { NotificationsModule } from '../notifications/notifications.module'
import { EventsGateway } from './events.gateway'

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET }),
    forwardRef(() => NotificationsModule),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class SocketModule {}
