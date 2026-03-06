import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import socket from '../services/socket';
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';
import TacticalMap from '../components/TacticalMap';

const ViewerScreen = ({ onLogout, name, allowedNodes = [] }) => {
  const [ghosts, setGhosts] = useState({});
  const [assignedNodes, setAssignedNodes] = useState(allowedNodes);
  const assignedNodesRef = useRef(allowedNodes);

  useEffect(() => {
    socket.on('ghost_online', (data) => {
      setAssignedNodes(prev => {
        const updated = prev.includes(data.name) ? prev : [...prev, data.name];
        assignedNodesRef.current = updated;
        return updated;
      });
    });

    socket.emit('join_viewer_rooms', { nodes: allowedNodes, viewerName: name });
    
    socket.on('heartbeat_update', (data) => {
      if (assignedNodesRef.current.includes(data.name)) {
        setGhosts(prev => ({ ...prev, [data.name]: data }));
      }
    });

    return () => {
      socket.off('heartbeat_update');
      socket.off('ghost_online');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="monitor-dashboard" size={20} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>SECURE MONITOR</Text>
            <Text style={styles.headerSubtitle}>{assignedNodes.length} NODES ASSIGNED</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <MaterialCommunityIcons name="logout-variant" size={16} color="#EF4444" style={{marginRight: 6}} />
          <Text style={styles.logoutTxt}>DISCONNECT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeText}>WELCOME, {name.toUpperCase()}</Text>
          <Text style={styles.welcomeSub}>Authorized secure feed access initialized.</Text>
        </View>

        {assignedNodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color="#38BDF8" size="large" />
            <Text style={styles.emptyText}>AWAITING ASSIGNED NODES...</Text>
          </View>
        ) : (
          assignedNodes.map((nodeName) => {
            const ghost = ghosts[nodeName];
            return (
              <View key={nodeName} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.nodeIdBadge}>
                    <MaterialCommunityIcons name="cellphone-link" size={16} color="#38BDF8" style={{marginRight: 6}} />
                    <Text style={styles.nodeTitle}>{nodeName.toUpperCase()}</Text>
                  </View>
                  <View style={ghost ? styles.statusBadgeOnline : styles.statusBadgeOffline}>
                    <View style={[styles.dot, ghost ? styles.dotGreen : styles.dotRed]} />
                    <Text style={[styles.statusText, ghost ? styles.textGreen : styles.textRed]}>
                      {ghost ? 'ONLINE' : 'OFFLINE'}
                    </Text>
                  </View>
                </View>
                
                {ghost ? (
                  <View style={styles.dataArea}>
                    <View style={styles.statsRow}>
                      <StatusCard 
                        battery={ghost.battery} 
                        connection={ghost.status} 
                        isCharging={ghost.isCharging} 
                      />
                    </View>
                    
                    <View style={styles.feedColumn}>
                      <Text style={styles.sectionLabel}>SECURE VIDEO STREAM</Text>
                      <VideoFeed ghostName={nodeName} />
                    </View>

                    <View style={styles.mapColumn}>
                      <Text style={styles.sectionLabel}>GEOGRAPHICAL POSITION</Text>
                      <TacticalMap location={ghost.location} ghostName={nodeName} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.offlineBox}>
                    <ActivityIndicator color="#64748B" size="small" style={{marginBottom: 12}} />
                    <Text style={styles.offlineText}>ESTABLISHING HANDSHAKE...</Text>
                    <Text style={styles.offlineSub}>Awaiting signal from remote node</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  // Header
  header: { 
    paddingTop: Platform.OS === 'android' ? 45 : 0, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1E293B', 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  headerTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  headerSubtitle: { color: '#38BDF8', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginTop: 2 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 20 },
  logoutTxt: { color: '#EF4444', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  content: { flex: 1, padding: 16 },
  
  welcomeBox: { marginBottom: 24, paddingLeft: 4 },
  welcomeText: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  welcomeSub: { color: '#64748B', fontSize: 12, marginTop: 4, fontWeight: '500' },

  emptyContainer: { flex: 1, marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 20 },

  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  nodeIdBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  nodeTitle: { color: '#F8FAFC', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  
  statusBadgeOnline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  statusBadgeOffline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  textGreen: { color: '#10B981' },
  textRed: { color: '#EF4444' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  dotGreen: { backgroundColor: '#10B981' },
  dotRed: { backgroundColor: '#EF4444' },

  dataArea: { gap: 20 },
  statsRow: { alignItems: 'flex-start' },
  sectionLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
  
  offlineBox: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  offlineText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  offlineSub: { color: '#64748B', fontSize: 10, marginTop: 6 }
});

export default ViewerScreen;
