import React, { useState, useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import io from 'socket.io-client';
import { ADMIN_SECRET_KEY } from '@env';

import LoginScreen from './screens/LoginScreen';
import AdminScreen from './screens/AdminScreen';
import ViewerScreen from './screens/ViewerScreen';
import GhostScreen from './screens/GhostScreen';

const socket = io("https://joyjet-server.onrender.com");

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [adminPresent, setAdminPresent] = useState(false);
  const [role, setRole] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userContext, setUserContext] = useState({ name: '', key: '' });

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('status_update', (data) => setAdminPresent(data.admin_present));
    socket.on('role_assigned', (data) => setRole(data.role === 'MASTER' ? 'ADMIN' : data.role));
    socket.on('update_list', (list) => setActiveUsers(list));
    socket.on('forced_disconnect', (data) => {
      Alert.alert("SYSTEM NOTICE", data.reason);
      setRole(null);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('status_update');
      socket.off('role_assigned');
      socket.off('update_list');
    };
  }, []);

  const handleLogoutLogic = () => {
    socket.emit('manual_logout');
    setRole(null);
    setUserContext({ name: '', key: '' });
  };

  const handleAuth = (targetRole, name, key) => {
    const cleanName = name.toLowerCase().trim();
    if (targetRole === "ADMIN") {
      if (adminPresent) {
        Alert.alert("Denied", "A Master session is already active.");
        return;
      }
      if (key === ADMIN_SECRET_KEY) {
        socket.emit('claim_admin', { key });
      } else {
        Alert.alert("Error", "Invalid Secret Key.");
      }
    } else {
      socket.emit('register_user', { name: cleanName, role: targetRole });
      setUserContext({ name: cleanName });
      setRole(targetRole);
    }
  };

  if (role === 'ADMIN') return <AdminScreen users={activeUsers} onLogout={handleLogoutLogic} onKick={(id) => socket.emit('admin_kick_user', id)} />;
  if (role === 'VIEWER') return <ViewerScreen users={activeUsers} name={userContext.name} onLogout={handleLogoutLogic} />;
  if (role === 'GHOST') return <GhostScreen name={userContext.name} />;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LoginScreen adminPresent={adminPresent} isConnected={isConnected} onEngage={handleAuth} />
    </>
  );
}
