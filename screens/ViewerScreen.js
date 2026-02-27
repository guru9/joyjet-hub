import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ViewerScreen({ users, name }) {
  const myGhostPrefix = name.toLowerCase().trim() + "_";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>VIEWER: {name.toUpperCase()}</Text>
      <ScrollView style={styles.radar}>
        <Text style={styles.label}>ASSIGNED GHOSTS (MAX 3)</Text>
        {users.filter(u => u.name.startsWith(myGhostPrefix)).map((user, i) => (
          <View key={i} style={styles.userRow}>
            <Text style={styles.userText}>>> {user.name.toUpperCase()}</Text>
          </View>
        ))}
        {users.filter(u => u.name.startsWith(myGhostPrefix)).length === 0 && (
          <Text style={styles.empty}>NO GHOSTS DETECTED</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 25, paddingTop: 60 },
  header: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  radar: { flex: 1, marginTop: 20, backgroundColor: '#050505', padding: 15, borderRadius: 5 },
  label: { color: '#444', fontSize: 10, marginBottom: 15 },
  userText: { color: '#FFD700', fontSize: 16, fontFamily: 'monospace', marginBottom: 10 },
  empty: { color: '#222', textAlign: 'center', marginTop: 20 }
});
