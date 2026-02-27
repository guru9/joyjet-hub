import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ adminPresent, onEngage, secretKey }) {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');

  const cleanInput = input.toLowerCase().trim().substring(0, 10);
  const isGhostFormat = cleanInput.includes('_');
  const isAlphabetOnly = /^[a-z]+$/.test(cleanInput);
  const isGhostValid = /^[a-z]+_[a-z]+$/.test(cleanInput);

  let btnText = "IDENTIFYING...";
  let type = "";

  if (!adminPresent && key === secretKey) { 
    btnText = "CLAIM MASTER"; type = "ADMIN"; 
  } else if (isGhostFormat) {
    btnText = isGhostValid ? "ENGAGE AS GHOST" : "INVALID ID";
    type = isGhostValid ? "GHOST" : "";
  } else if (isAlphabetOnly) {
    btnText = "ENGAGE AS VIEWER"; type = "VIEWER";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛩️ JOYJET</Text>
      <TextInput placeholder="Callsign" placeholderTextColor="#444" maxLength={10} onChangeText={setInput} style={styles.input} />
      {!adminPresent && <TextInput placeholder="Secret Key" secureTextEntry placeholderTextColor="#444" onChangeText={setKey} style={styles.input} />}
      <TouchableOpacity onPress={() => onEngage(type, cleanInput, key)} style={[styles.button, {opacity: type ? 1 : 0.4}]} disabled={!type}>
        <Text style={styles.btnText}>{btnText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 30, justifyContent: 'center' },
  logo: { color: '#FFD700', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#0A0A0A', color: '#FFD700', padding: 18, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  button: { backgroundColor: '#FFD700', padding: 20, borderRadius: 5, alignItems: 'center' },
  btnText: { fontWeight: 'bold', color: '#000' }
});
