import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.inner}>
        <View style={styles.headerWrapper}>
          <AppHeader isHub={true} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>SECURE AUTHENTICATION</Text>
          <Text style={styles.cardSubtitle}>Enter your assigned credentials to access the hub.</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="security" size={20} color="#38BDF8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ACCESS KEY"
                placeholderTextColor="#64748B"
                value={accessKey}
                onChangeText={setAccessKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {isAdmin && (
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-numeric" size={20} color="#38BDF8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="SECURE PIN"
                  placeholderTextColor="#64748B"
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <MaterialCommunityIcons name="connection" size={20} color="#0F172A" style={{marginRight: 10}} />
                <Text style={styles.buttonText}>INITIALIZE SESSION</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ENCRYPTED TLS v1.3</Text>
          </View>
          <Text style={styles.footer}>SECURED BY RENDER CLOUD • 2026</Text>
          <Text style={styles.versionTag}>JOYJET BUILD {APP_VERSION}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerWrapper: { marginBottom: 20 },
  
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  cardTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 8, textAlign: 'center' },
  cardSubtitle: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 24, lineHeight: 16 },
  
  inputGroup: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56
  },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1,
    color: '#F8FAFC', 
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  
  button: { 
    width: '100%', 
    height: 56, 
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonDisabled: { backgroundColor: '#64748B', shadowOpacity: 0 },
  buttonText: { color: '#0F172A', fontWeight: '800', letterSpacing: 1.5, fontSize: 13 },
  
  footerContainer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  badge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 16 },
  badgeText: { color: '#10B981', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  footer: { color: '#64748B', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 },
  versionTag: { color: '#334155', fontSize: 9, fontWeight: '700', letterSpacing: 1 }
});

export default LoginScreen;
