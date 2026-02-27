import React, { useState, useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import io from 'socket.io-client';
import { ADMIN_SECRET_KEY } from '@env';

// Corrected Imports based on your folder structure
import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import GhostScreen from './src/screens/GhostScreen';

// Replace with your actual Render URL
const socket = io("https://joyjet-server.onrender.com");

export default function App() {
  const [adminPresent, setAdminPresent] = useState(false);
  const [role, setRole] = useState(null); // 'ADMIN', 'VIEWER', or 'GHOST'
  const [activeUsers, setActiveUsers] = useState([]);
  const [userContext, setUserContext] = useState({ name: '', key: '' });

  useEffect(() => {
    // 1. Monitor Admin Presence
    socket.on('status_update', (data) => {
      setAdminPresent(data.admin_present);
    });

    // 2. Handle Role Assignment
    socket.on('role_assigned', (data) => {
      setRole(data.role === 'MASTER' ? 'ADMIN' : data.role);
    });

    // 3. Update Global User List (Radar)
    socket.on('update_list', (list) => {
      setActiveUsers(list);
    });

    // 4. Handle Admin Termination (The "Uninstall" Signal)
    socket.on('forced_disconnect', (data) => {
      Alert.alert("STRIKE", data.reason);
      setRole(null); // Boot to Login
      setUserContext({ name: '', key: '' });
    });

    return () => {
      socket.off('status_update');
      socket.off('role_assigned');
      socket.off('update_list');
      socket.off('forced_disconnect');
    };
  }, []);

  // Authentication & Logic Gatekeeper
  const handleAuth = (targetRole, name, key) => {
    const cleanName = name.toLowerCase().trim();

    if (targetRole === "ADMIN") {
      if (key === ADMIN_SECRET_KEY) {
        socket.emit('claim_admin', { key });
      } else {
        Alert.alert("Denied", "Secret Key Mismatch.");
      }
    } 
    else if (targetRole === "GHOST") {
      // Logic: Ghost must be 'viewername_ghostname'
      if (!cleanName.includes('_')) {
        Alert.alert("Invalid Format", "Ghost name must be: viewername_ghostname");
        return;
      }

      const prefix = cleanName.split('_')[0]; // Extract 'viewername'
      
      // Count existing ghosts for this specific viewer
      const ghostCount = activeUsers.filter(u => 
        u.role === 'GHOST' && u.name.startsWith(prefix + '_')
      ).length;

      if (ghostCount >= 3) {
        Alert.alert("System Full", `Limit reached: 3 Ghosts maximum for Viewer "${prefix}"`);
      } else {
        socket.emit('register_user', { name: cleanName, role: 'GHOST' });
        setUserContext({ name: cleanName });
        setRole('GHOST');
      }
    } 
    else if (targetRole === "VIEWER") {
      socket.emit('register_user', { name: cleanName, role: 'VIEWER' });
      setUserContext({ name: cleanName });
      setRole('VIEWER');
    }
  };

  const handleKickUser = (targetId) => {
    socket.emit('admin_kick_user', targetId);
  };

  // --- NAVIGATION ROUTING ---
  
  if (role === 'ADMIN') {
    return <AdminScreen users={activeUsers} onKick={handleKickUser} />;
  }

  if (role === 'VIEWER') {
    return <ViewerScreen users={activeUsers} name={userContext.name} />;
  }

  if (role === 'GHOST') {
    return <GhostScreen name={userContext.name} />;
  }

  // Default: Login Screen
  return (
    <>
      <StatusBar barStyle="light-content" />
      <LoginScreen 
        adminPresent={adminPresent} 
        onEngage={handleAuth} 
        secretKey={ADMIN_SECRET_KEY} 
      />
    </>
  );
}
