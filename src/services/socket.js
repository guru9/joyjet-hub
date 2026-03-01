import { io } from 'socket.io-client';

// Replace with your actual Render/Backend URL
const SOCKET_URL = 'https://your-backend-app.onrender.com';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false, // We manually connect after login
});

export default socket;
