import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusCard = ({ battery, connection, isCharging }) => (
  <View style={styles.bar}>
    <Text style={styles.stat}>🔋 {battery} {isCharging ? '⚡' : ''}</Text>
    <Text style={styles.stat}>📶 {connection || 'Checking...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#222', padding: 5, borderRadius: 5 },
  stat: { color: '#00ff00', fontSize: 11, fontWeight: 'bold' }
});

export default StatusCard;
