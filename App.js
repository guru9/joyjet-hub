import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ADMIN_SECRET_KEY } from '@env';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import GhostScreen from './src/screens/GhostScreen';

const socket = io("https://joyjet-hub.onrender.com");

export default function App() {
  const [adminPresent, setAdminPresent] = useState(false);
  const [role, setRole] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userContext, setUserContext] = useState({ name: '', key: '' });

  useEffect(() => {
    socket.on('status_update', (data) => setAdminPresent(data.admin_present));
    socket.on('role_assigned', (data) => setRole(data.role === 'MASTER' ? 'ADMIN' : data.role));
    socket.on('update_list', (list) => setActiveUsers(list));
    return () => socket.off();
  }, []);

  const handleAuth = (targetRole, name, key) => {
    setUserContext({ name, key });
    if (targetRole === "ADMIN") {
      socket.emit('claim_admin', { key });
    } else {
      socket.emit('register_user', { name, role: targetRole });
      setRole(targetRole);
    }
  };

  // The Page Switcher
  if (role === 'ADMIN') return <AdminScreen users={activeUsers} />;
  if (role === 'VIEWER') return <ViewerScreen users={activeUsers} name={userContext.name} />;
  if (role === 'GHOST') return <GhostScreen name={userContext.name} />;

  return (
    <LoginScreen 
      adminPresent={adminPresent} 
      onEngage={handleAuth} 
      secretKey={ADMIN_SECRET_KEY} 
    />
  );
}
