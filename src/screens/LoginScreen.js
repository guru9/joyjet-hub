import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';

import socket from '../services/socket'; 
import AppHeader from '../components/AppHeader';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

// ─────────────────────────────────────────────
// Role detection helpers
// ─────────────────────────────────────────────
const detectRole = (key) => {
  const k = key.trim().toLowerCase();
  if (k === 'admin') return 'admin';
  if (k.includes('_')) return 'ghost';
  return 'viewer';
};

const validateKey = (key) => {
  const k = key.trim();
  if (!k) return 'Access Key cannot be empty.';

  const role = detectRole(k);

  if (role === 'admin') return null; // admin always valid

  if (role === 'ghost') {
    // Must have underscore NOT at start or end
    if (k.startsWith('_') || k.endsWith('_')) {
      return 'Ghost key must be in format: viewerName_ghostName (no leading/trailing underscore).';
    }
    const parts = k.split('_');
    if (parts.length < 2 || parts[0].length < 4) {
      return `Viewer prefix must be at least 4 characters (got "${parts[0]}").`;
    }
    const ghostSuffix = parts.slice(1).join('_');
    if (ghostSuffix.length < 4) {
      return `Ghost name suffix must be at least 4 characters (got "${ghostSuffix}").`;
    }
    return null;
  }

  // Viewer
  if (k.length < 4) {
    return 'Viewer name must be at least 4 characters.';
  }

  return null;
};

const getRoleLabel = (key) => {
  const k = key.trim();
  if (!k) return null;
  const role = detectRole(k);
  if (role === 'admin') return '[ ADMIN — Enter Secure PIN below ]';
  if (role === 'ghost') {
    const parts = k.split('_');
    const viewerPart = parts[0].toUpperCase();
    const ghostPart = parts.slice(1).join('_').toUpperCase();
    return `[ GHOST "${ghostPart}" → linked to viewer "${viewerPart}" ]`;
  }
  return `[ VIEWER: ${k.toUpperCase()} ]`;
};

// ─────────────────────────────────────────────
// LoginScreen
// ─────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [accessKey, setAccessKey] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const role = detectRole(accessKey);
  const isAdmin = role === 'admin';
  const roleLabel = accessKey.trim().length > 0 ? getRoleLabel(accessKey) : null;

  // Validate on every keypress
  useEffect(() => {
    if (accessKey.trim().length === 0) {
      setValidationError(null);
      return;
    }
    setValidationError(validateKey(accessKey));
  }, [accessKey]);

  useEffect(() => {
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
    const key = accessKey.trim();

    const err = validateKey(key);
    if (err) {
      Alert.alert('Invalid Key', err);
      return;
    }

    if (isAdmin && !pin.trim()) {
      Alert.alert('Error', 'Admin requires a Secure PIN');
      return;
    }

    setLoading(true);

    if (!socket.connected) socket.connect();

    const attemptAuth = () => {
      socket.emit('authenticate', {
        user: key,
        pass: isAdmin ? pin.trim() : '',
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
            style={[styles.input, validationError ? styles.inputError : null]}
            placeholder="ACCESS KEY"
            placeholderTextColor="#333"
            value={accessKey}
            onChangeText={setAccessKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Show PIN only for admin */}
          {isAdmin && (
            <TextInput
              style={styles.input}
              placeholder="SECURE PIN"
              placeholderTextColor="#333"
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              autoCapitalize="none"
            />
          )}
        </View>

        {/* Role hint */}
        {roleLabel && !validationError && (
          <Text style={styles.roleHint}>{roleLabel}</Text>
        )}

        {/* Validation error */}
        {validationError && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, validationError && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading || !!validationError}
        >
          {loading ? (
            <ActivityIndicator color="#00ff00" />
          ) : (
            <Text style={styles.buttonText}>INITIALIZE SESSION</Text>
          )}
        </TouchableOpacity>

        {/* Format help */}
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>admin  |  viewer (≥4)  |  viewer_ghost (each ≥4)</Text>
        </View>

        <Text style={styles.footer}>SECURED BY RENDER CLOUD 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  inputContainer: { width: '100%', marginBottom: 10 },
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
  inputError: {
    borderColor: '#ff4444',
  },
  roleHint: {
    color: '#00aa00',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
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
  buttonDisabled: {
    borderColor: '#1a3d1a',
  },
  buttonText: { color: '#00ff00', fontWeight: 'bold', letterSpacing: 3, fontSize: 12 },
  helpBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#111',
    borderRadius: 4,
  },
  helpText: { color: '#222', fontSize: 8, letterSpacing: 1, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, color: '#222', fontSize: 8, letterSpacing: 1 }
});

export default LoginScreen;
