import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  if (socket && !socket.disconnected) {
    return socket;
  }

  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  const targetUrl = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:5000';

  if (socket) {
    socket.disconnect();
  }

  socket = io(targetUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
