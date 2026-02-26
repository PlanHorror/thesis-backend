import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Notification } from "@prisma/client";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
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

  /**
   * Client joins a room to receive notifications.
   * Payload: { room: string } - room is the user's Prisma ID (student/lecturer) or "admin"
   */
  @SubscribeMessage("join")
  async handleJoin(client: Socket, payload: { room: string }): Promise<void> {
    if (payload?.room) {
      await client.join(payload.room);
      this.logger.log(`Client ${client.id} joined room: ${payload.room}`);
    }
  }

  sendNotificationToUser(notification: Notification): void {
    if (notification.lecturerId) {
      this.server
        .to(notification.lecturerId)
        .emit("notification", notification);
    }

    if (notification.studentId) {
      this.server.to(notification.studentId).emit("notification", notification);
    }
    this.logger.log(
      `Notification sent to: ${notification.lecturerId ? notification.lecturerId : notification.studentId}`,
    );
  }

  sendNotificationToAdmin(notification: Notification): void {
    if (notification.isAdminBroadcast) {
      this.server.to("admin").emit("notification", notification);
      this.logger.log("Admin notification broadcast sent");
    }
  }
}
