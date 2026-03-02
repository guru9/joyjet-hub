import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';

// IMPORT: Make sure your socket service EXPORTS a function or a lazy-loaded object
import socket from '../services/socket'; 

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ONLY attach listeners if the socket is already initialized
    const setupListeners = () => {
      socket.on('auth_response', (response) => {
        setLoading(false);
        if (response.success) {
          onLogin(response.role, response.name, response.allowedNodes || []);
        } else {
          Alert.alert('Access Denied', response.message || 'Invalid credentials');
          socket.disconnect(); 
        }
      });

      socket.on('connect_error', () => {
        setLoading(false);
        Alert.alert('Connection Error', 'Server is currently unreachable.');
      });
    };

    setupListeners();

    return () => {
      socket.off('auth_response');
      socket.off('connect_error');
    };
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter credentials');
      return;
    }

    setLoading(true);

    // CRITICAL: Ensure connection ONLY starts after user clicks the button
    // This satisfies Android 16's "User-Initiated" network rules
    if (!socket.connected) {
      socket.connect();
    }

    // Wait for the connection to be established before sending data
    const attemptAuth = () => {
      socket.emit('authenticate', {
        user: username.trim(),
        pass: password.trim(),
        device: Platform.OS,
        version: '4.2.0'
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
        <Text style={styles.logo}>JOYJET HUB</Text>
        <Text style={styles.subtitle}>BATTERY OPTIMIZER AI v4.2</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ACCESS KEY"
            placeholderTextColor="#333"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="SECURE PIN"
            placeholderTextColor="#333"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
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
  logo: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 8 },
  subtitle: { color: '#444', fontSize: 10, marginTop: 5, marginBottom: 50, letterSpacing: 2 },
  inputContainer: { width: '100%', marginBottom: 20 },
  input: { 
    backgroundColor: '#050505', 
    borderWidth: 1, 
    borderColor: '#111', 
    color: '#00ff00', 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  button: { 
    width: '100%', 
    height: 55, 
    borderWidth: 1, 
    borderColor: '#00ff00', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10
  },
  buttonText: { color: '#00ff00', fontWeight: 'bold', letterSpacing: 3, fontSize: 12 },
  footer: { position: 'absolute', bottom: 30, color: '#222', fontSize: 8, letterSpacing: 1 }
});

export default LoginScreen;
