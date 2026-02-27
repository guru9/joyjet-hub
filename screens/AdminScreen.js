import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AdminScreen({ users }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>MASTER CONTROL</Text>
      <Text style={styles.subHeader}>Full Network Visibility</Text>
      
      <ScrollView style={styles.radar}>
        <Text style={styles.label}>CONNECTED NODES:</Text>
        {users.map((user, i) => (
          <View key={i} style={styles.userRow}>
            <Text style={styles.userText}>>> {user.name.toUpperCase()}</Text>
            <Text style={styles.roleTag}>{user.role}</Text>
          </View>
        ))}
        {users.length === 0 && <Text style={styles.empty}>NO ACTIVE NODES</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 25, paddingTop: 60 },
  header: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', letterSpacing: 3 },
  subHeader: { color: '#555', fontSize: 12, marginBottom: 20 },
  radar: { flex: 1, backgroundColor: '#050505', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#111' },
  label: { color: '#222', fontSize: 10, fontWeight: 'bold', marginBottom: 15 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111', pb: 5 },
  userText: { color: '#00FF00', fontSize: 14, fontFamily: 'monospace' },
  roleTag: { color: '#333', fontSize: 10, fontFamily: 'monospace' },
  empty: { color: '#222', textAlign: 'center', marginTop: 20 }
});
