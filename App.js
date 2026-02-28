import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import io from 'socket.io-client';
import * as TaskManager from 'expo-task-manager';
import LoginScreen from './screens/LoginScreen';
import GhostScreen from './screens/GhostScreen';
import AdminScreen from './screens/AdminScreen';

const SERVER_URL = "https://joyjet-server.onrender.com";
const socket = io(SERVER_URL, { reconnection: true, reconnectionDelay: 5000 });
const GPS_TASK = 'bg-gps';

TaskManager.defineTask(GPS_TASK, ({ data, error }) => {
    if (data) socket.emit('ghost_location_data', data.locations[0].coords);
});

export default function App() {
    const [status, setStatus] = useState({ connected: false, adminPresent: false });
    const [user, setUser] = useState(null);

    useEffect(() => {
        socket.on('connect', () => setStatus(s => ({ ...s, connected: true })));
        socket.on('disconnect', () => setStatus(s => ({ ...s, connected: false })));
        socket.on('status_update', (d) => setStatus(s => ({ ...s, adminPresent: d.admin_present })));
        socket.on('role_assigned', (d) => setUser(d));
        socket.on('forced_disconnect', (d) => { Alert.alert("System", d.reason); setUser(null); });
        
        return () => socket.removeAllListeners();
    }, []);

    if (!user) return <LoginScreen status={status} onLogin={(r, n, k) => socket.emit(r === 'ADMIN' ? 'claim_admin' : 'register_user', { name: n, role: r, key: k })} />;
    
    return (
        <>
            <StatusBar hidden={user.role === 'GHOST'} />
            {user.role === 'MASTER' ? <AdminScreen socket={socket} onExit={() => setUser(null)} /> :
             user.role === 'GHOST' ? <GhostScreen socket={socket} name={user.name} /> :
             <AdminScreen socket={socket} isViewer={true} onExit={() => setUser(null)} />}
        </>
    );
}
