import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function ViewerScreen({ users, name }) {
  // 1. Convert viewer name to lowercase for reliable matching
  const viewerPrefix = name.toLowerCase().trim();

  // 2. Filter list: Find ghosts that start with "viewername_"
  const myGhosts = users.filter(u => 
    u.role === 'GHOST' && 
    u.name.toLowerCase().startsWith(`${viewerPrefix}_`)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>VIEWER: {name.toUpperCase()}</Text>
      <Text style={styles.subHeader}>ASSIGNED GHOSTS (MAX 3)</Text>
      
      {myGhosts.length === 0 ? (
        <Text style={styles.none}>NO GHOSTS DETECTED</Text>
      ) : (
        <FlatList
          data={myGhosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.ghostCard}>
              <Text style={styles.ghostName}>{item.name.toUpperCase()}</Text>
              <Text style={styles.statusText}>• ONLINE & STEALTH ACTIVE</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 40, paddingTop: 80 },
  header: { color: '#FFD700', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subHeader: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 20 },
  none: { color: '#444', textAlign: 'center', marginTop: 50, letterSpacing: 2 },
  ghostCard: { 
    backgroundColor: '#111', 
    padding: 20, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#333',
    marginBottom: 15 
  },
  ghostName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  statusText: { color: '#00FF00', fontSize: 12, marginTop: 5 }
});
