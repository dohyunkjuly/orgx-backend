import { forwardRef, Inject, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { WsError, WS_UNAUTHORIZED } from '@lib/core'
import type { JwtPayload } from '../common/types/jwt-payload'
import { MarkAsReadDto } from '../notifications/dto/mark-as-read.dto'
import { NotificationsService } from '../notifications/notifications.service'

const ACCESS_COOKIE_NAME = 'accessToken'

/**
 * Single shared realtime gateway (default namespace). The client opens one
 * connection; it's authenticated on the handshake via the accessToken cookie
 * and auto-joined to its own `user:<id>` room. Features push to that room via
 * `emitToUser`. Inbound message handlers (e.g. markAsRead) must live here too.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS ?? 'http://localhost:3000',
    credentials: true, // required so the httpOnly accessToken cookie is sent on the handshake
  },
})
export class EventsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  @WebSocketServer()
  server!: Server

  constructor(
    private readonly jwt: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notifications: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const userId = await this.authenticate(client)
      client.data.userId = userId
      await client.join(this.room(userId))
    } catch (err) {
      const error = err instanceof WsError ? err.error : WS_UNAUTHORIZED
      client.emit('exception', error)
      client.disconnect(true)
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@ConnectedSocket() client: Socket, @MessageBody() dto: MarkAsReadDto) {
    try {
      await this.notifications.markAsRead(client.data.userId as string, dto.notificationId)
      return { notificationId: dto.notificationId, read: true }
    } catch (err) {
      if (err instanceof WsError) return err.error
      throw err
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const count = await this.notifications.markAllAsRead(client.data.userId as string)
    return { count }
  }

  /** Push an event to a connected user's sockets. */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(this.room(userId)).emit(event, payload)
  }

  private room(userId: string) {
    return `user:${userId}`
  }

  private async authenticate(client: Socket): Promise<string> {
    const token = this.extractToken(client)
    if (!token) throw new WsError(WS_UNAUTHORIZED)
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token)
      return payload.sub
    } catch {
      throw new WsError(WS_UNAUTHORIZED)
    }
  }

  private extractToken(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`))
      if (match) return decodeURIComponent(match.slice(ACCESS_COOKIE_NAME.length + 1))
    }

    const authToken = client.handshake.auth?.token
    return typeof authToken === 'string' ? authToken : null
  }
}
