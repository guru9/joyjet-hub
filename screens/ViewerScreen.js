import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ViewerScreen({ users, name }) {
  const prefix = name.split('_')[0];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>VIEWER: {name.toUpperCase()}</Text>
      
      <ScrollView style={styles.radar}>
        <Text style={styles.label}>LOCAL RADAR (PREFIX: {prefix.toUpperCase()})</Text>
        {users.map((user, i) => {
          if (user.name.startsWith(prefix)) {
            return (
              <Text key={i} style={styles.userText}>
                >> {user.name.toUpperCase()}
              </Text>
            );
          }
          return null;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 25, paddingTop: 60 },
  header: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  radar: { flex: 1, backgroundColor: '#050505', borderRadius: 8, padding: 15, marginTop: 20, borderWidth: 1, borderColor: '#111' },
  label: { color: '#333', fontSize: 10, marginBottom: 15 },
  userText: { color: '#FFD700', fontSize: 16, fontFamily: 'monospace', marginBottom: 10 }
});
