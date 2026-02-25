import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io("https://joyjet-hub.onrender.com"); 

export default function App() {
  const [adminPresent, setAdminPresent] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);

  useEffect(() => {
    socket.on('status_update', (data) => setAdminPresent(data.admin_present));
    socket.on('role_assigned', (data) => setRole(data.role === 'MASTER' ? 'ADMIN' : 'GHOST'));
  }, []);

  const handleStart = () => {
    if (!adminPresent && key === "YOUR_SECRET_8888") {
      socket.emit('claim_admin', { key });
    } else {
      socket.emit('register_ghost', { name });
      setRole('GHOST');
    }
  };

  if (role === 'ADMIN') return <View style={styles.center}><Text style={styles.text}>Master Online.</Text></View>;
  if (role === 'GHOST') return <View style={styles.center}><Text style={styles.text}>Pilot Engaged.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛩️ JOYJET</Text>
      <TextInput placeholder="Pilot Callsign" placeholderTextColor="#555" onChangeText={setName} style={styles.input} />
      {!adminPresent && (
        <TextInput placeholder="Secret Key" secureTextEntry placeholderTextColor="#555" onChangeText={setKey} style={styles.input} />
      )}
      <TouchableOpacity onPress={handleStart} style={styles.button}>
        <Text style={styles.btnText}>ENGAGE ENGINE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 25 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFD700', fontSize: 18 },
  logo: { color: '#FFD700', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FFD700', padding: 18, borderRadius: 10, alignItems: 'center' },
  btnText: { fontWeight: 'bold', fontSize: 16 }
});
