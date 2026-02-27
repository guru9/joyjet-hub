import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ExitManager from '../components/ExitManager';

export default function ViewerScreen({ users, name, onLogout }) {
  const viewerPrefix = name.toLowerCase().trim();
  const myGhosts = users.filter(u => 
    u.role === 'GHOST' && u.name.toLowerCase().startsWith(`${viewerPrefix}_`)
  );

  return (
    <View style={styles.container}>
      <View style={{ alignSelf: 'flex-end' }}>
        <ExitManager onLogout={onLogout} label="LOGOUT" styleType="viewer" />
      </View>
      <Text style={styles.header}>VIEWER: {name.toUpperCase()}</Text>
      <FlatList
        data={myGhosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}><Text style={{color: 'white'}}>{item.name.toUpperCase()}</Text></View>
        )}
        ListEmptyComponent={<Text style={{color: '#444', textAlign: 'center'}}>NO GHOSTS</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 60 },
  header: { color: 'gold', fontSize: 18, textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#111', padding: 20, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: 'lime' }
});
