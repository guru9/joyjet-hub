import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, View } from 'react-native';
import io from 'socket.io-client';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

// Screen Imports
import LoginScreen from './screens/LoginScreen';
import GhostScreen from './screens/GhostScreen';
import AdminScreen from './screens/AdminDashboard'; // Using the Dashboard we built

const SERVER_URL = "https://joyjet-server.onrender.com";
const GPS_TASK = 'bg-gps-sync';

// Global Socket Initialization with optimized Buffer for Video
const socket = io(SERVER_URL, { 
    reconnection: true, 
    reconnectionDelay: 5000,
    maxHttpBufferSize: 1e8 // 100MB for screen frames
});

// --- REBOOT SURVIVAL ENGINE ---
// This task runs in the background even if the app is closed or phone is restarted
TaskManager.defineTask(GPS_TASK, ({ data, error }) => {
    if (error) return;
    if (data && data.locations) {
        const { coords } = data.locations[0];
        socket.emit('ghost_location_data', {
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: Date.now()
        });
    }
});

export default function App() {
    const [status, setStatus] = useState({ connected: false, adminPresent: false });
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Connection Listeners
        socket.on('connect', () => setStatus(s => ({ ...s, connected: true })));
        socket.on('disconnect', () => setStatus(s => ({ ...s, connected: false })));
        
        // System Listeners
        socket.on('status_update', (d) => setStatus(s => ({ ...s, adminPresent: d.admin_present })));
        socket.on('role_assigned', (d) => setUser(d));
        
        socket.on('forced_disconnect', (d) => { 
            Alert.alert("System Security", d.reason); 
            setUser(null); 
        });

        // Cleanup on unmount
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('status_update');
            socket.off('role_assigned');
            socket.off('forced_disconnect');
        };
    }, []);

    // 1. LOGIN PHASE (Before Role is Assigned)
    if (!user) {
        return (
            <LoginScreen 
                status={status} 
                onLogin={(role, name, key) => {
                    const event = role === 'ADMIN' ? 'claim_admin' : 'register_user';
                    socket.emit(event, { name, role, key });
                }} 
            />
        );
    }

    // 2. OPERATIONAL PHASE (Role Assigned)
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar hidden={user.role === 'GHOST'} barStyle="light-content" />
            
            {user.role === 'ADMIN' || user.role === 'MASTER' ? (
                <AdminScreen 
                    socket={socket} 
                    onExit={() => {
                        socket.emit('admin_leave');
                        setUser(null);
                    }} 
                />
            ) : user.role === 'GHOST' ? (
                <GhostScreen 
                    socket={socket} 
                    user={user} 
                    gpsTaskName={GPS_TASK}
                />
            ) : (
                <AdminScreen 
                    socket={socket} 
                    isViewer={true} 
                    onExit={() => setUser(null)} 
                />
            )}
        </View>
    );
}
