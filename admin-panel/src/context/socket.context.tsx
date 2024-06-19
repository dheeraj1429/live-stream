'use client';

import { createContext, useContext } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_BACKEND_URL = 'http://localhost';

export interface Context {
  socket: Socket;
}

export const socket = io(SOCKET_BACKEND_URL);

export const SocketContext = createContext<Context>({
  socket,
});

export const SocketsProvider = function (props: any) {
  return <SocketContext.Provider value={{ socket }} {...props} />;
};
export const useSockets = () => useContext(SocketContext);
