import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { Notification } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(notification: Notification): void {
    if (notification.lecturerId) {
      this.server
        .to(notification.lecturerId)
        .emit('notification', notification);
    }

    if (notification.studentId) {
      this.server.to(notification.studentId).emit('notification', notification);
    }
    this.logger.log(
      `Notification sent to: ${notification.lecturerId ? notification.lecturerId : notification.studentId}`,
    );
  }
}
