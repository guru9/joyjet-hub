import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function AdminScreen({ socket, user, onExit }) {
    const [feed, setFeed] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        socket.on('screen_frame', (data) => setFeed(`data:image/jpeg;base64,${data.frame}`));
        return () => socket.off('screen_frame');
    }, []);

    const toggleStatus = () => {
        const newStatus = !isOffline;
        setIsOffline(newStatus);
        socket.emit('toggle_visibility', { hidden: newStatus });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.roleLabel}>{user.role}: {user.name}</Text>
                <TouchableOpacity 
                    style={[styles.statusBtn, { backgroundColor: isOffline ? '#333' : '#00ff44' }]} 
                    onPress={toggleStatus}
                >
                    <Text style={styles.statusText}>{isOffline ? "OFFLINE" : "ONLINE"}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.monitor}>
                {feed ? <Image source={{ uri: feed }} style={styles.live} /> : <Text style={styles.noSig}>AWAITING NODES...</Text>}
            </View>

            <View style={styles.footer}>
                {user.role === 'ADMIN' ? (
                    <TouchableOpacity style={styles.wipeBtn} onPress={() => socket.emit('admin_wipe', 'TARGET_ID')}>
                        <Text style={{color: '#f00', fontSize: 10, fontWeight: 'bold'}}>WIPE GHOST</Text>
                    </TouchableOpacity>
                ) : <View />}

                <TouchableOpacity style={styles.exitBtn} onPress={() => { socket.disconnect(); onExit(); }}>
                    <Text style={styles.exitText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#111' },
    roleLabel: { color: '#444', fontSize: 10, fontWeight: 'bold' },
    statusBtn: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 3 },
    statusText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
    monitor: { flex: 1, backgroundColor: '#050505', justifyContent: 'center' },
    live: { width: '100%', height: '100%', resizeMode: 'contain' },
    noSig: { color: '#111', textAlign: 'center', fontSize: 11 },
    footer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    wipeBtn: { borderSize: 1, borderColor: '#f00', padding: 10, borderRadius: 5, borderWidth: 1 },
    exitBtn: { padding: 10 },
    exitText: { color: '#555', fontSize: 11, fontWeight: 'bold' }
});
