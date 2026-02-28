import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, View } from 'react-native';
import io from 'socket.io-client';
import * as TaskManager from 'expo-task-manager';
import LoginScreen from './screens/LoginScreen';
import GhostScreen from './screens/GhostScreen';
import AdminScreen from './screens/AdminScreen';

const SERVER_URL = "https://joyjet-server.onrender.com";
const socket = io(SERVER_URL, { maxHttpBufferSize: 1e8, reconnection: true });
const GPS_TASK = 'bg-gps-sync';

// BACKGROUND TASK (Survives Reboot)
TaskManager.defineTask(GPS_TASK, ({ data, error }) => {
    if (data) {
        socket.emit('ghost_location_data', { 
            ghostName: "AUTO_WAKE", 
            coords: data.locations[0].coords 
        });
    }
});

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        socket.on('role_assigned', (data) => setUser(data));
        socket.on('system_alert', (data) => Alert.alert("System", data.msg));
        
        return () => socket.removeAllListeners();
    }, []);

    if (!user) {
        return (
            <LoginScreen 
                onLogin={(role, name, key) => {
                    const event = role === 'ADMIN' ? 'claim_admin' : role === 'VIEWER' ? 'claim_viewer' : 'register_user';
                    socket.emit(event, { name, role, key });
                }} 
            />
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar hidden={user.role === 'GHOST'} barStyle="light-content" />
            {user.role === 'GHOST' ? (
                <GhostScreen socket={socket} name={user.name} taskName={GPS_TASK} />
            ) : (
                <AdminScreen socket={socket} user={user} onExit={() => setUser(null)} />
            )}
        </View>
    );
}
