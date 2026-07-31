import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface StockUpdateEvent {
  productId: string;
  stockQuantity: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onStockUpdated: (callback: (data: StockUpdateEvent) => void) => () => void;
  onOrderCreated: (callback: (order: any) => void) => () => void;
  onOrderUpdated: (callback: (order: any) => void) => () => void;
  onProductUpdated: (callback: (product: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Client] Connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const onStockUpdated = (callback: (data: StockUpdateEvent) => void) => {
    if (!socket) return () => {};
    socket.on('stock_updated', callback);
    return () => {
      socket.off('stock_updated', callback);
    };
  };

  const onOrderCreated = (callback: (order: any) => void) => {
    if (!socket) return () => {};
    socket.on('order_created', callback);
    return () => {
      socket.off('order_created', callback);
    };
  };

  const onOrderUpdated = (callback: (order: any) => void) => {
    if (!socket) return () => {};
    socket.on('order_updated', callback);
    return () => {
      socket.off('order_updated', callback);
    };
  };

  const onProductUpdated = (callback: (product: any) => void) => {
    if (!socket) return () => {};
    socket.on('product_updated', callback);
    return () => {
      socket.off('product_updated', callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onStockUpdated,
        onOrderCreated,
        onOrderUpdated,
        onProductUpdated,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
