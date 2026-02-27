import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import ExitManager from '../components/ExitManager';

export default function AdminScreen({ users, onKick, onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.header}>MASTER HUB</Text>
        <ExitManager onLogout={onLogout} label="EXIT SYSTEM" styleType="admin" />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name.toUpperCase()}</Text>
            <TouchableOpacity onPress={() => onKick(item.id)} style={styles.kick}>
              <Text style={styles.kickT}>UNINSTALL</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 60 },
  headerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  header: { color: 'red', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#111', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: 'white' },
  kick: { backgroundColor: 'red', padding: 8, borderRadius: 4 },
  kickT: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});
