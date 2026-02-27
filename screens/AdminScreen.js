import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function AdminScreen({ users, onKick }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>MASTER CONTROL</Text>
      <ScrollView>
        {users.map((user, i) => (
          <View key={i} style={styles.row}>
            <View>
              <Text style={styles.name}>{user.name.toUpperCase()}</Text>
              <Text style={styles.role}>{user.role}</Text>
            </View>
            {user.role !== 'MASTER' && (
              <TouchableOpacity onPress={() => onKick(user.id)} style={styles.kickBtn}>
                <Text style={styles.kickTxt}>UNINSTALL</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  header: { color: '#00FF00', fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#111' },
  name: { color: '#FFF', fontSize: 14, fontFamily: 'monospace' },
  role: { color: '#444', fontSize: 10 },
  kickBtn: { backgroundColor: '#300', padding: 10, borderRadius: 5, borderColor: '#F00', borderWidth: 1 },
  kickTxt: { color: '#F00', fontSize: 10, fontWeight: 'bold' }
});
