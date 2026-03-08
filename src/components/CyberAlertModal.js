import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CyberAlertModal = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'info', 'danger', 'success'

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('show_cyber_alert', (data) => {
      setTitle(data.title || 'SYSTEM ALERT');
      setMessage(data.message || '');
      setType(data.type || 'info');
      setVisible(true);
    });
    return () => listener.remove();
  }, []);

  if (!visible) return null;

  const getConfig = () => {
    switch(type) {
      case 'danger': return { icon: 'alert-octagon', color: '#EF4444', border: '#EF4444' };
      case 'success': return { icon: 'check-circle', color: '#10B981', border: '#10B981' };
      default: return { icon: 'information', color: '#38BDF8', border: '#38BDF8' };
    }
  };

  const config = getConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderColor: config.border, shadowColor: config.border }]}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name={config.icon} size={28} color={config.color} />
            <Text style={[styles.modalTitle, { color: config.color }]}>{title.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.modalDesc}>{message}</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: config.color, shadowColor: config.color }]} 
              onPress={() => setVisible(false)}
            >
              <Text style={styles.modalBtnTxt}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#0B0F19', borderRadius: 16, padding: 24, borderWidth: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: 12 },
  modalDesc: { color: '#94A3B8', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  modalBtn: { width: '100%', height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  modalBtnTxt: { color: '#0F172A', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 }
});

export default CyberAlertModal;
