import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Vibration, SafeAreaView, StatusBar } from 'react-native';
import socket from '../services/socket';

// Import Child Components
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';
import LogConsole from '../components/LogConsole';

const AdminScreen = () => {
  const [ghosts, setGhosts] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Listen for "Heartbeats" (Battery/Network/Charging)
    socket.on('heartbeat_update', (data) => {
      setGhosts(prev => ({ 
        ...prev, 
        [data.name]: { ...prev[data.name], ...data, lastSeen: Date.now() } 
      }));
    });

    // 2. Listen for "System Logs" (Who is watching, Errors, Disconnects)
    socket.on('log_update', (newLog) => {
      // Add a timestamp if the server didn't provide one
      const logWithTime = {
        ...newLog,
        timestamp: newLog.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setLogs(prev => [...prev, logWithTime].slice(-50)); // Keep last 50 logs

      // Trigger Alert Vibration for Errors
      if (newLog.type === 'ERROR') {
        Vibration.vibrate([0, 150, 100, 150]); 
      }
    });

    // 3. Cleanup on unmount
    return () => {
      socket.off('heartbeat_update');
      socket.off('log_update');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JOYJET HUB / COMMAND</Text>
        <View style={styles.onlineIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.onlineCount}>{Object.keys(ghosts).length} NODES ONLINE</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.nodeList} contentContainerStyle={{ paddingBottom: 20 }}>
        {Object.values(ghosts).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>WAITING FOR GHOST NODES...</Text>
          </View>
        ) : (
          Object.values(ghosts).map((ghost) => (
            <View key={ghost.name} style={styles.ghostCard}>
              
              {/* Node Title */}
              <View style={styles.cardHeader}>
                <Text style={styles.nodeId}>NODE :: {ghost.name.toUpperCase()}</Text>
                {Date.now() - ghost.lastSeen > 10000 && (
                  <Text style={styles.offlineWarning}>SIGNAL WEAK</Text>
                )}
              </View>

              {/* Status Child Component */}
              <StatusCard 
                battery={ghost.battery} 
                connection={ghost.connection} 
                isCharging={ghost.isCharging} 
              />

              {/* Video Feed Child Component */}
              <View style={styles.videoContainer}>
                <VideoFeed ghostName={ghost.name} />
              </View>

            </View>
          ))
        )}
      </ScrollView>

      {/* Log Console Child Component */}
      <LogConsole logs={logs} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#050505'
  },
  headerTitle: { color: '#fff', fontSize: 12, letterSpacing: 4, fontWeight: '300' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00ff00', marginRight: 6 },
  onlineCount: { color: '#00ff00', fontSize: 9, fontWeight: 'bold' },
  nodeList: { flex: 1, padding: 12 },
  ghostCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    shadowColor: '#00ff00',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  nodeId: { color: '#444', fontSize: 10, fontWeight: '900' },
  offlineWarning: { color: '#ff4444', fontSize: 9, fontWeight: 'bold' },
  videoContainer: { marginTop: 12 },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#222', fontSize: 12, letterSpacing: 2 }
});

export default AdminScreen;
