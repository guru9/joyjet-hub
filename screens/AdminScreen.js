import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminScreen({ socket, onLogout }) {
    const [pinpointActive, setPinpointActive] = useState(false);
    const [battery, setBattery] = useState('N/A');

    useEffect(() => {
        // Listen for ghost status updates
        socket.on('ghost_status', (data) => {
            if (data.battery) setBattery(`${data.battery}%`);
        });
        
        // If server auto-kills pinpoint, update UI
        socket.on('admin_command', (cmd) => {
            if (cmd === 'STOP_PINPOINT') setPinpointActive(false);
        });
    }, []);

    const togglePinpoint = () => {
        const cmd = pinpointActive ? 'STOP_PINPOINT' : 'START_PINPOINT';
        socket.emit('admin_command', cmd);
        setPinpointActive(!pinpointActive);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.statusLabel}>GHOST POWER: <Text style={{color: '#0f0'}}>{battery}</Text></Text>
            </View>

            <View style={styles.monitor}>{/* Stream Display */}</View>

            <View style={styles.controls}>
                <TouchableOpacity 
                    style={[styles.pinBtn, pinpointActive && styles.pinBtnActive]} 
                    onPress={togglePinpoint}
                >
                    <Text style={styles.btnTxt}>
                        {pinpointActive ? "🛰️ PINPOINT ACTIVE (5M LIMIT)" : "🛰️ REQUEST PINPOINT"}
                    </Text>
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
// Styles as previously defined..
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: 'red', fontWeight: 'bold', fontSize: 20 },
  card: { backgroundColor: '#111', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: 'white' },
  kick: { backgroundColor: 'red', padding: 5, borderRadius: 4 },
  kickT: { color: 'white', fontSize: 10 }
});
