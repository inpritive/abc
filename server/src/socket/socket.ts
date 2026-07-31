import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

export const emitStockUpdate = (productId: string, stockQuantity: number) => {
  if (io) {
    io.emit('stock_updated', { productId, stockQuantity });
    console.log(`[Socket.IO] Emitted stock_updated: ${productId} -> ${stockQuantity}`);
  }
};

export const emitOrderCreated = (order: any) => {
  if (io) {
    io.emit('order_created', order);
    console.log(`[Socket.IO] Emitted order_created: ${order.orderNumber}`);
  }
};

export const emitOrderUpdated = (order: any) => {
  if (io) {
    io.emit('order_updated', order);
    console.log(`[Socket.IO] Emitted order_updated: ${order.orderNumber}`);
  }
};

export const emitProductUpdated = (product: any) => {
  if (io) {
    io.emit('product_updated', product);
    console.log(`[Socket.IO] Emitted product_updated: ${product._id}`);
  }
};
