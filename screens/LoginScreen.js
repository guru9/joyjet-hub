import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ adminPresent, isConnected, onEngage }) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JOYJET HUB</Text>

      <View style={styles.statusContainer}>
        {/* LATEST FEATURE: Visual Connection Health */}
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#0F0' : '#F00' }]} />
        <Text style={[styles.statusText, { color: isConnected ? '#AAA' : '#F00' }]}>
          {isConnected ? "SYSTEMS ONLINE" : "SERVER OFFLINE"}
        </Text>
      </View>
      
      {!adminPresent && isConnected && (
        <TextInput 
          placeholder="Secret Key" 
          placeholderTextColor="#444" 
          secureTextEntry 
          style={styles.input} 
          onChangeText={setKey} 
          value={key}
        />
      )}

      <TouchableOpacity 
        style={[styles.adminBtn, (adminPresent || !isConnected) && styles.disabledBtn]} 
        onPress={() => onEngage("ADMIN", "", key)}
        disabled={adminPresent || !isConnected}
      >
        <Text style={styles.btnText}>
          {!isConnected ? "CONNECTING..." : adminPresent ? "MASTER HUB OCCUPIED" : "ENTER MASTER HUB"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TextInput 
        placeholder="Username (viewer or ghost)" 
        placeholderTextColor="#444" 
        style={styles.input} 
        onChangeText={setName} 
        value={name}
      />

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.subBtn, !isConnected && {opacity: 0.5}]} 
          onPress={() => onEngage("VIEWER", name, "")}
          disabled={!isConnected}
        >
          <Text style={styles.btnText}>VIEWER</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.subBtn, !isConnected && {opacity: 0.5}, {borderColor: '#0F0'}]} 
          onPress={() => onEngage("GHOST", name, "")}
          disabled={!isConnected}
        >
          <Text style={[styles.btnText, {color: isConnected ? '#0F0' : '#FFF'}]}>GHOST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 30 },
  logo: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 15, letterSpacing: 5 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  input: { backgroundColor: '#111', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  adminBtn: { backgroundColor: '#F00', padding: 18, borderRadius: 8, marginBottom: 10 },
  disabledBtn: { backgroundColor: '#111', borderColor: '#333', borderWidth: 1, opacity: 0.7 },
  subBtn: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#444', borderRadius: 8, marginHorizontal: 5 },
  btnText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 30 },
  row: { flexDirection: 'row' }
});
