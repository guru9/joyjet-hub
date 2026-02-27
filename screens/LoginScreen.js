import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ adminPresent, onEngage }) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JOYJET HUB</Text>
      <TextInput placeholder="Secret Key" placeholderTextColor="#444" secureTextEntry style={styles.input} onChangeText={setKey} />
      <TouchableOpacity 
        style={[styles.adminBtn, adminPresent && styles.occupied]} 
        onPress={() => onEngage("ADMIN", "", key)}
      >
        <Text style={styles.btnText}>{adminPresent ? "ADMIN ALREADY EXISTS" : "ENTER MASTER HUB"}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TextInput placeholder="Username" placeholderTextColor="#444" style={styles.input} onChangeText={setName} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.subBtn} onPress={() => onEngage("VIEWER", name, "")}><Text style={styles.btnText}>VIEWER</Text></TouchableOpacity>
        <TouchableOpacity style={styles.subBtn} onPress={() => onEngage("GHOST", name, "")}><Text style={styles.btnText}>GHOST</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 30 },
  logo: { color: '#FFF', fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15 },
  adminBtn: { backgroundColor: '#F00', padding: 18, borderRadius: 8 },
  occupied: { backgroundColor: '#300', opacity: 0.7 },
  subBtn: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#444', borderRadius: 8, marginHorizontal: 5 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 30 },
  row: { flexDirection: 'row' }
});
