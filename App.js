import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import io from 'socket.io-client';
import { ADMIN_SECRET_KEY } from '@env';

import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import GhostScreen from './src/screens/GhostScreen';

const socket = io("https://joyjet-server.onrender.com");

export default function App() {
  const [adminPresent, setAdminPresent] = useState(false);
  const [role, setRole] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userContext, setUserContext] = useState({ name: '', key: '' });

  useEffect(() => {
    socket.on('status_update', (data) => setAdminPresent(data.admin_present));
    socket.on('role_assigned', (data) => setRole(data.role === 'MASTER' ? 'ADMIN' : data.role));
    socket.on('update_list', (list) => setActiveUsers(list));

    socket.on('forced_disconnect', (data) => {
      Alert.alert("STRIKE", data.reason);
      setRole(null);
      setUserContext({ name: '', key: '' });
    });

    return () => socket.off();
  }, []);

  const handleAuth = (targetRole, name, key) => {
    const cleanName = name.toLowerCase().trim();
    
    if (targetRole === "ADMIN" && key === ADMIN_SECRET_KEY) {
      socket.emit('claim_admin', { key });
    } else if (targetRole === "GHOST") {
      // THE 3-GHOST LIMIT LOGIC
      const prefix = cleanName.split('_')[0] + "_";
      const ghostCount = activeUsers.filter(u => u.name.startsWith(prefix)).length;

      if (ghostCount >= 3) {
        Alert.alert("LOCKOUT", `Viewer "${prefix.replace('_','')}" already has 3 active Ghosts.`);
      } else {
        socket.emit('register_user', { name: cleanName, role: 'GHOST' });
        setUserContext({ name: cleanName, key });
        setRole('GHOST');
      }
    } else if (targetRole === "VIEWER") {
      socket.emit('register_user', { name: cleanName, role: 'VIEWER' });
      setUserContext({ name: cleanName, key });
      setRole('VIEWER');
    }
  };

  return role === 'ADMIN' ? <AdminScreen users={activeUsers} onKick={(id) => socket.emit('admin_kick_user', id)} /> :
         role === 'VIEWER' ? <ViewerScreen users={activeUsers} name={userContext.name} /> :
         role === 'GHOST' ? <GhostScreen name={userContext.name} /> :
         <LoginScreen adminPresent={adminPresent} onEngage={handleAuth} secretKey={ADMIN_SECRET_KEY} />;
}
