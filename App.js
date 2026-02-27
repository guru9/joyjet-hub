import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import io from 'socket.io-client';
import { ADMIN_SECRET_KEY } from '@env'; 

const socket = io("https://joyjet-hub.onrender.com"); 

export default function App() {
  const [adminPresent, setAdminPresent] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Listen for server status
    socket.on('status_update', (data) => setAdminPresent(data.admin_present));
    
    // Listen for role assignment from server
    socket.on('role_assigned', (data) => {
      setRole(data.role === 'MASTER' ? 'ADMIN' : 'GHOST');
    });
    
    return () => socket.off(); 
  }, []);

  const handleStart = () => {
    // 1. Try to claim ADMIN if nobody is there and key matches ****_****
    if (!adminPresent && key === ADMIN_SECRET_KEY) {
      socket.emit('claim_admin', { key });
    } 
    // 2. Otherwise, register as a GHOST pilot
    else if (name.trim().length > 0) {
      socket.emit('register_ghost', { name });
      setRole('GHOST');
    } 
    // 3. Error handling
    else {
      Alert.alert("Access Denied", "Enter a Callsign to engage engine.");
    }
  };

  // UI for when you are the Master
  if (role === 'ADMIN') {
    return (
      <View style={styles.center}>
        <Text style={[styles.text, { color: '#00FF00' }]}>MASTER ONLINE</Text>
        <Text style={styles.subText}>JoyJet Hub Controlled</Text>
      </View>
    );
  }

  // UI for when you are a Pilot
  if (role === 'GHOST') {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>PILOT ENGAGED</Text>
        <Text style={styles.subText}>Infiltrating Hub...</Text>
      </View>
    );
  }

  // Main Login Screen
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.logo}>🛩️ JOYJET</Text>
      
      <TextInput 
        placeholder="Pilot Callsign" 
        placeholderTextColor="#555" 
        onChangeText={setName} 
        style={styles.input} 
      />

      {!adminPresent && (
        <TextInput 
          placeholder="Admin Secret Key" 
          secureTextEntry 
          placeholderTextColor="#555" 
          onChangeText={setKey} 
          style={styles.input} 
        />
      )}

      <TouchableOpacity onPress={handleStart} style={styles.button}>
        <Text style={styles.btnText}>ENGAGE ENGINE</Text>
      </TouchableOpacity>
      
      <Text style={styles.statusFooter}>
        Server Status: {adminPresent ? "Master Present" : "Awaiting Master..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 25 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFD700', fontSize: 28, fontWeight: 'bold', letterSpacing: 3 },
  subText: { color: '#555', marginTop: 10, fontSize: 14, letterSpacing: 1 },
  logo: { color: '#FFD700', fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FFD700', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', fontSize: 18, color: '#000' },
  statusFooter: { color: '#333', textAlign: 'center', marginTop: 30, fontSize: 12 }
});
