import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import socket from '../services/socket';
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';
import TacticalMap from '../components/TacticalMap';

const ViewerScreen = ({ onLogout, name, allowedNodes = [] }) => {
  const [ghosts, setGhosts] = useState({});

  useEffect(() => {
    socket.emit('join_viewer_rooms', { nodes: allowedNodes });
    socket.on('heartbeat_update', (data) => {
      if (allowedNodes.includes(data.name)) {
        setGhosts(prev => ({ ...prev, [data.name]: data }));
      }
    });

    return () => {
      socket.off('heartbeat_update');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>JOYJET / MONITOR</Text>
        <Text style={styles.subText}>{allowedNodes.length} NODES ASSIGNED</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutTxt}>[ LOGOUT ]</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {allowedNodes.map((nodeName) => {
          const ghost = ghosts[nodeName];
          return (
            <View key={nodeName} style={styles.card}>
              <Text style={styles.nodeTitle}>{nodeName.toUpperCase()}</Text>
              
              {ghost ? (
                <>
                  <StatusCard battery={ghost.battery} />
                  <VideoFeed ghostName={nodeName} />
                  <TacticalMap location={ghost.location} ghostName={nodeName} />
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
  logoutBtn: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 0.5, borderColor: '#ff4444', borderRadius: 3 },
  logoutTxt: { color: '#ff4444', fontSize: 7, letterSpacing: 2 },
  list: { padding: 15 },
  card: { backgroundColor: '#080808', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#111' },
  nodeTitle: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  videoBox: { marginTop: 10 },
  offlineBox: { height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', borderRadius: 5 },
  offlineText: { color: '#222', fontSize: 10, letterSpacing: 1 }
});

export default ViewerScreen;
