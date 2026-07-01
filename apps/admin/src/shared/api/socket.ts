import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;
let connected = false;

const listeners: Record<string, Set<(data: any) => void>> = {};

export async function fetchDevToken(apiUrl: string, role: string): Promise<string> {
  // Use real token if available
  const realToken = getToken();
  if (realToken) return realToken;

  // Fall back to dev-token endpoint (demo mode only)
  try {
    const res = await fetch(`${apiUrl}/api/auth/dev-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId: `${role}-001` }),
    });
    if (!res.ok) throw new Error('Failed to get dev token');
    const data = await res.json();
    localStorage.setItem('sm_jwt_token', data.token);
    localStorage.setItem('sm_user_id', data.userId);
    return data.token;
  } catch (err) {
    console.warn('[AUTH] Could not fetch dev token:', err);
    return '';
  }
}

export function connectSocket(apiUrl: string, token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(apiUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    connected = true;
    console.log('[SOCKET] Connected:', socket?.id);
    notifyListeners('_connected', {});
  });

  socket.on('disconnect', () => {
    connected = false;
    console.log('[SOCKET] Disconnected');
    notifyListeners('_disconnected', {});
  });

  socket.on('connect_error', (err) => {
    console.warn('[SOCKET] Connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connected = false;
  }
}

export function isConnected(): boolean {
  return connected;
}

export function joinMatchRoom(matchId: string) {
  socket?.emit('join_match', matchId);
}

export function leaveMatchRoom(matchId: string) {
  socket?.emit('leave_match', matchId);
}

export function onMatchEvent(callback: (data: any) => void): () => void {
  return addListener('match_event', callback);
}

export function onScoreUpdate(callback: (data: any) => void): () => void {
  return addListener('score_update', callback);
}

export function onStatusChange(callback: (data: any) => void): () => void {
  return addListener('match_status_change', callback);
}

export function onStandingUpdate(callback: (data: any) => void): () => void {
  return addListener('standing_update', callback);
}

export function onNotification(callback: (data: any) => void): () => void {
  return addListener('notification', callback);
}

export function onConnectionChange(callback: (data: any) => void): () => void {
  const unsub1 = addListener('_connected', callback);
  const unsub2 = addListener('_disconnected', callback);
  return () => { unsub1(); unsub2(); };
}

function addListener(event: string, callback: (data: any) => void): () => void {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(callback);

  socket?.on(event, callback);

  return () => {
    listeners[event]?.delete(callback);
    socket?.off(event, callback);
  };
}

function notifyListeners(event: string, data: any) {
  listeners[event]?.forEach((cb) => cb(data));
}
