import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView } from 'react-native';
import socket from '../services/socket';

// Reuse the Child Components we already built
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';

const ViewerScreen = ({ route }) => {
  const [ghosts, setGhosts] = useState({});
  // These are the specific 3 ghosts this viewer is allowed to see
  const { allowedNodes } = route.params || { allowedNodes: ['Ghost_1', 'Ghost_2', 'Ghost_3'] };

  useEffect(() => {
    // 1. Tell the server to only send data for these specific rooms
    socket.emit('join_viewer_rooms', { nodes: allowedNodes });

    // 2. Listen for Vitals for ONLY these nodes
    socket.on('heartbeat_update', (data) => {
      if (allowedNodes.includes(data.name)) {
        setGhosts(prev => ({ ...prev, [data.name]: data }));
      }
    });

    return () => {
      socket.off('heartbeat_update');
      socket.emit('leave_viewer_rooms', { nodes: allowedNodes });
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>JOYJET / MONITOR</Text>
        <Text style={styles.subText}>{allowedNodes.length} NODES ASSIGNED</Text>
      </View>

      <ScrollView style={styles.list}>
        {allowedNodes.map((nodeName) => {
          const ghost = ghosts[nodeName];
          return (
            <View key={nodeName} style={styles.card}>
              <Text style={styles.nodeTitle}>{nodeName.toUpperCase()}</Text>
              
              {ghost ? (
                <>
                  <StatusCard 
                    battery={ghost.battery} 
                    connection={ghost.connection} 
                    isCharging={ghost.isCharging} 
                  />
                  <View style={styles.videoBox}>
                    <VideoFeed ghostName={nodeName} />
                  </View>
                </>
              ) : (
                <View style={styles.offlineBox}>
                  <Text style={styles.offlineText}>NODE OFFLINE / CONNECTING...</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#111' },
  headerText: { color: '#fff', fontSize: 14, letterSpacing: 3 },
  subText: { color: '#444', fontSize: 10, marginTop: 5 },
  list: { padding: 15 },
  card: { backgroundColor: '#080808', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#111' },
  nodeTitle: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  videoBox: { marginTop: 10 },
  offlineBox: { height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', borderRadius: 5 },
  offlineText: { color: '#222', fontSize: 10, letterSpacing: 1 }
});

export default ViewerScreen;
