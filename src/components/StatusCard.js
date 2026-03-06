import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StatusCard = ({ battery, connection, isCharging }) => (
  <View style={styles.bar}>
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={isCharging ? "battery-charging" : "battery"} size={16} color={isCharging ? "#10B981" : "#38BDF8"} style={styles.icon} />
      <Text style={styles.stat}>{battery || '--'}</Text>
    </View>
    <View style={styles.separator} />
    <View style={styles.statItem}>
      <MaterialCommunityIcons name="wifi" size={16} color={connection === 'CONNECTED' ? "#10B981" : "#94A3B8"} style={styles.icon} />
      <Text style={[styles.stat, connection !== 'CONNECTED' && { color: '#94A3B8' }]}>{connection || 'UNKNOWN'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  statItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  separator: { width: 1, height: 16, backgroundColor: '#334155', marginHorizontal: 4 },
  icon: { marginRight: 6 },
  stat: { color: '#F8FAFC', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }
});

export default StatusCard;
