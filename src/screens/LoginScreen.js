import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';

import socket from '../services/socket'; 
import AppHeader from '../components/AppHeader';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

const detectRole = (key) => {
  const k = key.trim().toLowerCase();
  if (k === 'admin') return 'admin';
  if (k.includes('_')) return 'ghost';
  return 'viewer';
};

const LoginScreen = ({ onLogin }) => {
  const [accessKey, setAccessKey] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const role = detectRole(accessKey);
  const isAdmin = role === 'admin';

  useEffect(() => {
    const onAuthResponse = (response) => {
      setLoading(false);
      if (response.success) {
        onLogin(response.role, response.name, response.allowedNodes || []);
      } else {
        // FIX: Removed socket.disconnect() to prevent app crash/exit
        Alert.alert('Access Denied', response.message || 'Invalid credentials');
      }
    };

    socket.on('auth_response', onAuthResponse);
    socket.on('connect_error', () => {
      setLoading(false);
      Alert.alert('Connection Error', 'The master server is unreachable.');
    });

    return () => {
      socket.off('auth_response', onAuthResponse);
      socket.off('connect_error');
    };
  }, [onLogin]);

  const handleLogin = () => {
    const key = accessKey.trim();
    if (!key) return Alert.alert('Error', 'Please enter an Access Key');
    if (isAdmin && !pin.trim()) return Alert.alert('Error', 'Admin requires a Secure PIN');

    setLoading(true);
    if (!socket.connected) socket.connect();

    const attemptAuth = () => {
      socket.emit('authenticate', {
        user: key,
        // Send actual pin for admin, or 'nopass' for others to satisfy data integrity
        pass: isAdmin ? pin.trim() : 'nopass', 
        device: Platform.OS,
        version: APP_VERSION
      });
    };

    if (socket.connected) {
      attemptAuth();
    } else {
      socket.once('connect', attemptAuth);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <AppHeader isHub={true} />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ACCESS KEY"
            placeholderTextColor="#444"
            value={accessKey}
            onChangeText={setAccessKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isAdmin && (
            <TextInput
              style={styles.input}
              placeholder="SECURE PIN"
              placeholderTextColor="#444"
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              autoCapitalize="none"
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#00ff00" />
          ) : (
            <Text style={styles.buttonText}>INITIALIZE SESSION</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>SECURED BY RENDER CLOUD 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  inputContainer: { width: '100%', marginBottom: 15 },
  input: { 
    backgroundColor: '#050505', 
    borderWidth: 1, 
    borderColor: '#00ff00', // Green Outline
    color: '#00ff00', 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  button: { 
    width: '100%', 
    height: 55, 
    backgroundColor: '#00ff0022', // Subtle green glow
    borderWidth: 1, 
    borderColor: '#00ff00', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 5
  },
  buttonText: { color: '#00ff00', fontWeight: 'bold', letterSpacing: 3, fontSize: 12 },
  footer: { position: 'absolute', bottom: 30, color: '#00ff00', opacity: 0.6, fontSize: 9, letterSpacing: 1 } // More visible color
});

export default LoginScreen;
