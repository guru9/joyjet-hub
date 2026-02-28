import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function AdminDashboard({ socket }) {
    const [feed, setFeed] = useState(null);
    const [status, setStatus] = useState({ battery: 0, online: false });

    useEffect(() => {
        socket.on('screen_frame', (img) => setFeed(`data:image/jpeg;base64,${img}`));
        socket.on('ghost_status', (data) => setStatus({ ...data, online: true }));
    }, []);

    const getColor = (lvl) => {
        if (lvl > 50) return '#0F0';
        if (lvl > 20) return '#FF0';
        return '#F00';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>NODE-01</Text>
                <View style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: status.online ? getColor(status.battery) : '#333' }]} />
                    <Text style={{ color: getColor(status.battery), fontWeight: 'bold' }}>{status.battery}%</Text>
                </View>
            </View>

            <View style={styles.monitor}>
                {feed ? <Image source={{ uri: feed }} style={styles.full} /> : <Text style={styles.txt}>NO SIGNAL</Text>}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.btn} onPress={() => socket.emit('admin_command', 'START_LIVE')}>
                    <Text style={styles.btxt}>LIVE VIDEO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => socket.emit('admin_command', 'START_PINPOINT')}>
                    <Text style={styles.btxt}>GPS TRACK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 30, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#111' },
    title: { color: '#444', letterSpacing: 3 },
    row: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    monitor: { flex: 1, justifyContent: 'center', backgroundColor: '#050505' },
    full: { width: '100%', height: '100%', resizeMode: 'contain' },
    footer: { padding: 25, flexDirection: 'row', justifyContent: 'space-around' },
    btn: { padding: 15, borderWidth: 1, borderColor: '#333', borderRadius: 4 },
    btxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    txt: { color: '#111', textAlign: 'center' }
});
