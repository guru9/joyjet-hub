import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('viewer'); // Default role

  const handleEntry = () => {
    if (!name) return Alert.alert("Required", "Please enter a Name");
    // Pass name and role back to App.js
    onLogin({ name, role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JOYJET HUB</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Identity Name" 
        placeholderTextColor="#666"
        onChangeText={setName}
      />

      <View style={styles.roleRow}>
        {['admin', 'viewer', 'ghost'].map((r) => (
          <TouchableOpacity 
            key={r} 
            style={[styles.roleBtn, role === r && styles.activeBtn]} 
            onPress={() => setRole(r)}
          >
            <Text style={styles.roleText}>{r.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.entryBtn} onPress={handleEntry}>
        <Text style={styles.entryText}>INITIALIZE SYSTEM</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 30 },
  logo: { color: '#0f0', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 5, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  roleBtn: { padding: 10, borderBottomWidth: 2, borderBottomColor: '#222' },
  activeBtn: { borderBottomColor: '#0f0' },
  roleText: { color: '#fff', fontSize: 12 },
  entryBtn: { backgroundColor: '#0f0', padding: 18, borderRadius: 5, alignItems: 'center' },
  entryText: { color: '#000', fontWeight: 'bold' }
});
