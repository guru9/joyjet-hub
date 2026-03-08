/**
 * CyberAlertModal — Global themed alert system.
 *
 * Triggered via: GlobalAlert.show(title, message, type)
 * Types: 'info' | 'success' | 'danger' | 'warning'
 *
 * Registered at App root so it can overlay ANY screen.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';

// Color/icon config per alert type
const TYPE_CONFIG = {
  danger:  { icon: 'alert-octagon',  color: COLORS.red,   label: '// THREAT DETECTED' },
  success: { icon: 'check-decagram', color: COLORS.green,  label: '// OPERATION SUCCESS' },
  warning: { icon: 'alert-rhombus',  color: COLORS.amber,  label: '// CAUTION' },
  info:    { icon: 'information-outline', color: COLORS.cyan, label: '// SYSTEM NOTICE' },
};

const CyberAlertModal = () => {
  const [visible, setVisible]  = useState(false);
  const [title, setTitle]      = useState('');
  const [message, setMessage]  = useState('');
  const [type, setType]        = useState('info');

  // Listen for global show_cyber_alert events
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('show_cyber_alert', (data) => {
      setTitle(data.title || 'SYSTEM ALERT');
      setMessage(data.message || '');
      setType(data.type || 'info');
      setVisible(true);
    });
    return () => sub.remove();
  }, []);

  if (!visible) return null;

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={[styles.panel, { borderColor: cfg.color, shadowColor: cfg.color }]}>

          {/* Decorative top scanline */}
          <View style={[styles.topBar, { backgroundColor: cfg.color }]} />

          {/* Header row */}
          <View style={styles.header}>
            <MaterialCommunityIcons name={cfg.icon} size={26} color={cfg.color} />
            <View style={styles.headerText}>
              <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
              <Text style={styles.title}>{title.toUpperCase()}</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Dismiss */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: cfg.color, shadowColor: cfg.color }]}
            onPress={() => setVisible(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>ACKNOWLEDGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  panel: {
    width: '100%',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  topBar:     { height: 3, width: '100%' },
  header:     { flexDirection: 'row', alignItems: 'flex-start', padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerText: { marginLeft: 14, flex: 1 },
  typeLabel:  { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 3, fontFamily: 'monospace' },
  title:      { color: COLORS.textPrimary, fontSize: 17, fontWeight: '900', letterSpacing: 1.5 },
  message:    { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, paddingHorizontal: 20, paddingVertical: 16 },
  btn: {
    margin: 20, marginTop: 4,
    height: 48, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  btnText: { color: COLORS.bg, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
});

export default CyberAlertModal;
