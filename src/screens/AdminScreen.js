import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import socket from '../services/socket';

const AdminScreen = () => {
  const [ghosts, setGhosts] = useState({});

  useEffect(() => {
    // Listen for the heartbeat updates from the Ghost
    socket.on('heartbeat_update', (data) => {
      setGhosts(prev => ({ ...prev, [data.name]: data }));
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIVE GHOST NODES</Text>
      <ScrollView>
        {Object.values(ghosts).map((ghost) => (
          <View key={ghost.name} style={styles.nodeCard}>
            {/* The New Status Bar */}
            <View style={styles.statusBar}>
              <Text style={styles.nodeName}>{ghost.name}</Text>
              <Text style={styles.statText}>🔋 {ghost.battery} {ghost.isCharging ? '⚡' : ''}</Text>
              <Text style={styles.statText}>📶 {ghost.connection}</Text>
            </View>
            
            {/* HD Video Placeholder */}
            <View style={styles.videoWindow}>
              <Text style={styles.placeholderText}>RECEIVING HD STREAM...</Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>WAKE</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, {backgroundColor: '#440000'}]}><Text style={styles.btnText}>WIPE</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  nodeCard: { backgroundColor: '#1e1e1e', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#2a2a2a' },
  nodeName: { color: '#00ff00', fontWeight: 'bold' },
  statText: { color: '#ccc', fontSize: 12 },
  videoWindow: { width: '100%', height: 200, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#333', fontSize: 12 },
  controls: { flexDirection: 'row', padding: 10, justifyContent: 'space-around' },
  btn: { padding: 8, backgroundColor: '#333', borderRadius: 5, width: '45%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});

export default AdminScreen;
