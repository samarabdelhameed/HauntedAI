// Managed by Kiro
// WebSocket Notification Service - Sends real-time notifications
// Requirements: 4.3

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export interface DeploymentNotification {
  type: 'deployment.complete';
  roomId: string;
  deploymentUrl: string;
  codeCid: string;
  timestamp: Date;
}

export interface NotificationPayload {
  type: string;
  data: any;
  timestamp: Date;
}

export class WebSocketNotificationService {
  private io: SocketIOServer;
  private authenticatedSockets: Map<string, Set<string>> = new Map(); // roomId -> Set<socketId>

  constructor(httpServer: HttpServer, corsOrigin: string = '*') {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io',
    });

    this.setupConnectionHandlers();
  }

  /**
   * Setup connection handlers with authentication
   * Requirements: 4.3
   */
  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: { roomId: string; token?: string }) => {
        // TODO: Validate JWT token when authentication is fully implemented
        // For now, just validate roomId exists
        if (!data.roomId) {
          socket.emit('error', { message: 'Room ID is required' });
          socket.disconnect();
          return;
        }

        // Join room
        socket.join(data.roomId);

        // Track authenticated socket
        if (!this.authenticatedSockets.has(data.roomId)) {
          this.authenticatedSockets.set(data.roomId, new Set());
        }
        this.authenticatedSockets.get(data.roomId)!.add(socket.id);

        socket.emit('authenticated', { roomId: data.roomId });
        console.log(`[WebSocket] Client ${socket.id} authenticated for room ${data.roomId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);

        // Remove from authenticated sockets
        for (const [roomId, sockets] of this.authenticatedSockets.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              this.authenticatedSockets.delete(roomId);
            }
          }
        }
      });
    });
  }

  /**
   * Send deployment completion notification
   * Requirements: 4.3
   */
  async sendDeploymentNotification(
    roomId: string,
    deploymentUrl: string,
    codeCid: string,
  ): Promise<void> {
    const notification: DeploymentNotification = {
      type: 'deployment.complete',
      roomId,
      deploymentUrl,
      codeCid,
      timestamp: new Date(),
    };

    // Send to all clients in the room
    this.io.to(roomId).emit('notification', notification);

    console.log(`[WebSocket] Sent deployment notification to room ${roomId}`);
  }

  /**
   * Send generic notification to a room
   */
  async sendNotification(roomId: string, type: string, data: any): Promise<void> {
    const notification: NotificationPayload = {
      type,
      data,
      timestamp: new Date(),
    };

    this.io.to(roomId).emit('notification', notification);

    console.log(`[WebSocket] Sent ${type} notification to room ${roomId}`);
  }

  /**
   * Get count of connected clients for a room
   */
  getConnectedClientsCount(roomId: string): number {
    return this.authenticatedSockets.get(roomId)?.size || 0;
  }

  /**
   * Close WebSocket server
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        console.log('[WebSocket] Server closed');
        resolve();
      });
    });
  }
}
