/**
 * LoginScreen — Master authentication gateway.
 * Role is inferred from the access key format:
 *   'admin'   → Admin role (requires PIN)
 *   'X_Ghost' → Ghost node (underscore = ghost)
 *   else      → Viewer
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import socket from '../services/socket';
import AppHeader from '../components/AppHeader';
import GlobalAlert from '../utils/GlobalAlert';
import { COLORS, RADIUS, SHADOW } from '../utils/theme';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

// Infer role without server round-trip for UX purposes
const detectRole = (key) => {
  const k = key.trim().toLowerCase();
  if (k === 'admin') return 'admin';
  if (k.includes('_')) return 'ghost';
  return 'viewer';
};

const LoginScreen = ({ onLogin }) => {
  const [accessKey, setAccessKey] = useState('');
  const [pin, setPin]             = useState('');
  const [loading, setLoading]     = useState(false);

  const role    = detectRole(accessKey);
  const isAdmin = role === 'admin';

  // -- Socket auth listeners --
  useEffect(() => {
    const onAuthResponse = (response) => {
      setLoading(false);
      if (response.success) {
        onLogin(response.role, response.name, response.allowedNodes || []);
      } else {
        GlobalAlert.show('ACCESS DENIED', response.message || 'Invalid credentials.', 'danger');
      }
    };

    socket.on('auth_response', onAuthResponse);
    socket.on('connect_error', () => {
      setLoading(false);
      GlobalAlert.show('NO SIGNAL', 'Master server is unreachable. Check your network.', 'danger');
    });

    return () => {
      socket.off('auth_response', onAuthResponse);
      socket.off('connect_error');
    };
  }, [onLogin]);

  // -- Authenticate --
  const handleLogin = () => {
    const key = accessKey.trim();
    if (!key) return GlobalAlert.show('MISSING KEY', 'Enter your access key to proceed.', 'info');
    if (isAdmin && !pin.trim()) return GlobalAlert.show('PIN REQUIRED', 'Admin access requires a Secure PIN.', 'info');

    setLoading(true);
    if (!socket.connected) socket.connect();

    const attemptAuth = () => socket.emit('authenticate', {
      user: key,
      pass: isAdmin ? pin.trim() : 'nopass',
      device: Platform.OS,
      version: APP_VERSION,
    });

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <AppHeader isHub />
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>☣ COMMAND ACCESS</Text>
          <Text style={styles.cardSub}>NEURAL AUTH · SECURE DIRECT CONNECT</Text>

          <View style={styles.fields}>
            {/* Access Key */}
            <View style={styles.fieldRow}>
              <MaterialCommunityIcons name="security" size={18} color={COLORS.cyan} style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="ACCESS KEY"
                placeholderTextColor={COLORS.textMuted}
                value={accessKey}
                onChangeText={setAccessKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {/* Live role indicator */}
              {accessKey.length > 0 && (
                <View style={[styles.roleTag, role === 'admin' ? styles.roleAdmin : (role === 'ghost' ? styles.roleGhost : styles.roleViewer)]}>
                  <Text style={styles.roleText}>{role.toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* PIN — admin only */}
            {isAdmin && (
              <View style={styles.fieldRow}>
                <MaterialCommunityIcons name="lock-numeric-outline" size={18} color={COLORS.cyan} style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="SECURE PIN"
                  placeholderTextColor={COLORS.textMuted}
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry
                  autoCapitalize="none"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <>
                <MaterialCommunityIcons name="login-variant" size={18} color={COLORS.bg} style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>BOOT SYSTEM INTERFACE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Footer */}
        <View style={styles.footer}>
          <View style={styles.secBadge}>
            <MaterialCommunityIcons name="shield-check" size={12} color={COLORS.green} style={{ marginRight: 5 }} />
            <Text style={styles.secText}>TLS v1.3 ENCRYPTED</Text>
          </View>
          <Text style={styles.buildText}>JOYJET BUILD {APP_VERSION} · © 2026</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },

  logoWrapper: { marginBottom: 36 },

  // Card
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  cardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '900', letterSpacing: 2.5, textAlign: 'center', marginBottom: 6 },
  cardSub:   { color: COLORS.textMuted, fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 24 },

  // Fields
  fields: { marginBottom: 20 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 14,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1, color: COLORS.textPrimary,
    fontSize: 13, fontWeight: '700', letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Live role tag
  roleTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  roleAdmin:  { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)' },
  roleGhost:  { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.4)' },
  roleViewer: { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.3)' },
  roleText: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: COLORS.textPrimary },

  // Button
  btn: {
    height: 54, width: '100%',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.md,
    ...SHADOW.cyan,
  },
  btnDisabled: { backgroundColor: COLORS.textMuted, shadowOpacity: 0 },
  btnText: { color: COLORS.bg, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  // Footer
  footer: { position: 'absolute', bottom: 36, alignItems: 'center' },
  secBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  secText:  { color: COLORS.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  buildText: { color: COLORS.textMuted, fontSize: 9, letterSpacing: 1, fontWeight: '600' },
});

export default LoginScreen;
