import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ExitManager from '../components/ExitManager';

export default function ViewerScreen({ users, name, onLogout }) {
  const myGhosts = users.filter(u => u.role === 'GHOST' && u.name.toLowerCase().startsWith(`${name.toLowerCase()}_`));
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
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  header: { color: 'gold', fontSize: 20, textAlign: 'center', marginVertical: 20 },
  card: { backgroundColor: '#111', padding: 15, marginBottom: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: 'lime' }
});
