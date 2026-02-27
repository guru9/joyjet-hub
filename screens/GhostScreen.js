import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GhostScreen({ name }) {
  const prefix = name.split('_')[0];

  return (
    <View style={styles.container}>
      <View style={styles.statusBox}>
        <Text style={styles.ghostName}>{name.toUpperCase()}</Text>
        <View style={styles.divider} />
        <Text style={styles.statusText}>STATUS: STEALTH ACTIVE</Text>
        <Text style={styles.infoText}>Visible to Viewer: {prefix}</Text>
      </View>
      
      <View style={styles.bottomDecor}>
        <Text style={styles.decorText}>GHOST_PROTOCOL_ENGAGED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 30, justifyContent: 'center' },
  statusBox: { padding: 30, borderWidth: 1, borderColor: '#FF0000', borderRadius: 2 },
  ghostName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', letterSpacing: 4 },
  divider: { height: 1, backgroundColor: '#FF0000', marginVertical: 20, opacity: 0.3 },
  statusText: { color: '#FF0000', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  infoText: { color: '#333', fontSize: 10, textAlign: 'center', marginTop: 10 },
  bottomDecor: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  decorText: { color: '#111', fontSize: 10, letterSpacing: 5 }
});
