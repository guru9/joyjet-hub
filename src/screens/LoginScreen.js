/**
 * LoginScreen — Master authentication gateway.
 *
 * Key-format rules (validated in real-time):
 *  Admin  → exactly 'admin' (case-insensitive)
 *  Viewer → alphanumeric only, min 4 chars, no special characters
 *  Ghost  → prefix_suffix format: both segments alphanumeric,
 *            prefix ≥ 4 chars, suffix ≥ 1 char,
 *            underscore is the ONLY separator allowed,
 *            prefix must match an active admin or viewer (checked live via socket)
 */
import React, { useState, useEffect, useRef } from 'react';
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

// ── Role detection from key format ────────────────────────────────────────────
const detectRole = (key) => {
  const k = key.trim().toLowerCase();
  if (k === 'admin') return 'admin';
  if (k.includes('_')) return 'ghost';
  return 'viewer';
};

// ── Format validation (returns string error or null) ─────────────────────────
const validateKey = (key) => {
  if (!key) return null; // nothing typed yet — no error

  const k = key.trim();
  const lower = k.toLowerCase();

  if (lower === 'admin') return null; // admin is always valid format

  if (lower.includes('_')) {
    // Ghost: must be exactly one underscore
    const parts = lower.split('_');
    if (parts.length !== 2)
      return 'Ghost key must have exactly one underscore (prefix_suffix).';

    const [prefix, suffix] = parts;

    if (!/^[a-z0-9]+$/.test(prefix))
      return 'Prefix must be alphanumeric only (no special characters).';

    if (prefix.length < 4)
      return `Prefix too short — need at least 4 characters (${prefix.length}/4).`;

    if (!/^[a-z0-9]+$/.test(suffix))
      return 'Suffix (ghost name) must be alphanumeric only (no special characters).';

    if (suffix.length < 4)
      return `Suffix too short — need at least 4 characters (${suffix.length}/4).`;

    return null;
  }

  // Viewer / Admin
  if (!/^[a-z0-9]+$/i.test(k))
    return 'Access key must be alphanumeric only (no special characters).';

  if (k.length < 4)
    return `Key too short — need at least 4 characters (${k.length}/4).`;

  return null;
};

const LoginScreen = ({ onLogin }) => {
  const [accessKey, setAccessKey]           = useState('');
  const [pin, setPin]                       = useState('');
  const [loading, setLoading]               = useState(false);
  const [formatError, setFormatError]       = useState(null);
  const [prefixStatus, setPrefixStatus]     = useState(null); // null | 'checking' | 'valid' | 'invalid'
  const prefixDebounceRef                   = useRef(null);

  const role    = detectRole(accessKey);
  const isAdmin = role === 'admin';

  // ── Live socket listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const onAuth = (response) => {
      setLoading(false);
      if (response.success) {
        onLogin(response.role, response.name, response.allowedNodes || []);
      } else {
        GlobalAlert.show('ACCESS DENIED', response.message || 'Invalid credentials.', 'danger');
      }
    };
    const onConnectError = () => {
      setLoading(false);
      GlobalAlert.show('NO SIGNAL', 'Master server is unreachable. Check your network.', 'danger');
    };
    const onPrefixResult = ({ valid }) => {
      setPrefixStatus(valid ? 'valid' : 'invalid');
    };

    socket.on('auth_response', onAuth);
    socket.on('connect_error', onConnectError);
    socket.on('prefix_result', onPrefixResult);

    return () => {
      socket.off('auth_response', onAuth);
      socket.off('connect_error', onConnectError);
      socket.off('prefix_result', onPrefixResult);
    };
  }, [onLogin]);

  // ── Key change handler — validates format + debounces prefix check ─────────
  const handleKeyChange = (text) => {
    // Only allow alphanumeric + underscore while typing
    const sanitized = text.replace(/[^a-zA-Z0-9_]/g, '');
    setAccessKey(sanitized);

    const error = validateKey(sanitized);
    setFormatError(error);
    setPrefixStatus(null);

    // Ghost prefix live-check: fire when user finishes typing prefix (after '_')
    if (sanitized.includes('_')) {
      const prefix = sanitized.split('_')[0].toLowerCase();
      if (prefix.length >= 4 && /^[a-z0-9]+$/.test(prefix)) {
        setPrefixStatus('checking');
        clearTimeout(prefixDebounceRef.current);
        prefixDebounceRef.current = setTimeout(() => {
          if (!socket.connected) socket.connect();
          if (socket.connected) {
            socket.emit('check_prefix', { prefix });
          } else {
            socket.once('connect', () => socket.emit('check_prefix', { prefix }));
          }
        }, 600); // debounce 600ms
      }
    }
  };

  // ── Authenticate ───────────────────────────────────────────────────────────
  const handleLogin = () => {
    const key = accessKey.trim();

    // Final format check before submit
    const err = validateKey(key);
    if (err) return GlobalAlert.show('INVALID FORMAT', err, 'warning');

    if (!key) return GlobalAlert.show('MISSING KEY', 'Enter your access key to continue.', 'info');
    if (isAdmin && !pin.trim()) return GlobalAlert.show('PIN REQUIRED', 'Admin access requires a Secure PIN.', 'info');

    // Warn but don't block if prefix check is invalid (server will reject anyway)
    if (role === 'ghost' && prefixStatus === 'invalid') {
      return GlobalAlert.show(
        'INVALID PREFIX',
        `Prefix '${key.split('_')[0]}' does not match any active admin or viewer. Ensure the parent user is logged in first.`,
        'danger'
      );
    }

    setLoading(true);
    if (!socket.connected) socket.connect();

    const attemptAuth = () => socket.emit('authenticate', {
      user:    key,
      pass:    isAdmin ? pin.trim() : 'nopass',
      device:  Platform.OS,
      version: APP_VERSION,
    });

    if (socket.connected) {
      attemptAuth();
    } else {
      socket.once('connect', attemptAuth);
    }
  };

  // ── Prefix indicator helper ────────────────────────────────────────────────
  const renderPrefixIndicator = () => {
    if (role !== 'ghost' || prefixStatus === null) return null;
    const icons = {
      checking: { name: 'loading',        color: COLORS.cyan,  label: 'VERIFYING PREFIX...' },
      valid:    { name: 'check-circle',   color: COLORS.green, label: 'PREFIX VALID' },
      invalid:  { name: 'close-circle',   color: COLORS.red,   label: 'PREFIX NOT FOUND' },
    };
    const cfg = icons[prefixStatus];
    return (
      <View style={[styles.prefixBadge, { borderColor: cfg.color + '60', backgroundColor: cfg.color + '12' }]}>
        <MaterialCommunityIcons name={cfg.name} size={13} color={cfg.color} style={{ marginRight: 5 }} />
        <Text style={[styles.prefixBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
            <View style={[
              styles.fieldRow,
              formatError && styles.fieldError,
              !formatError && accessKey.length >= 4 && styles.fieldOk
            ]}>
              <MaterialCommunityIcons name="security" size={18} color={
                formatError ? COLORS.red : (accessKey.length >= 4 ? COLORS.green : COLORS.cyan)
              } style={styles.fieldIcon} />

              <TextInput
                style={styles.input}
                placeholder="ACCESS KEY"
                placeholderTextColor={COLORS.textMuted}
                value={accessKey}
                onChangeText={handleKeyChange}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Live role pill */}
              {accessKey.length > 0 && !formatError && (
                <View style={[styles.roleTag,
                  role === 'admin'  ? styles.roleAdmin  :
                  role === 'ghost'  ? styles.roleGhost  :
                  styles.roleViewer
                ]}>
                  <Text style={[styles.roleText, {
                    color: role === 'admin' ? COLORS.red :
                           role === 'ghost' ? COLORS.amber : COLORS.cyan
                  }]}>{role.toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* Format error message */}
            {formatError && (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={12} color={COLORS.red} style={{ marginRight: 5 }} />
                <Text style={styles.errorText}>{formatError}</Text>
              </View>
            )}

            {/* Ghost prefix result badge */}
            {renderPrefixIndicator()}

            {/* Ghost format hint */}
            {role === 'ghost' && !formatError && (
              <Text style={styles.hintText}>
                Format: <Text style={{ color: COLORS.cyan }}>prefix_suffix</Text>
                {'  ·  '}Both prefix & suffix must be alphanumeric, min 4 chars each.
              </Text>
            )}

            {/* Admin PIN */}
            {isAdmin && (
              <View style={[styles.fieldRow, { marginTop: 8 }]}>
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

          {/* Login button */}
          <TouchableOpacity
            style={[styles.btn, (loading || !!formatError) && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading || !!formatError}
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
  inner:     { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoWrapper: { marginBottom: 32 },

  // Card
  card: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: 24,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  cardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '900', letterSpacing: 2.5, textAlign: 'center', marginBottom: 6 },
  cardSub:   { color: COLORS.textMuted, fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },

  // Fields
  fields: { marginBottom: 16 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, height: 54, marginBottom: 4,
  },
  fieldError: { borderColor: COLORS.red },
  fieldOk:    { borderColor: 'rgba(16,185,129,0.4)' },
  fieldIcon:  { marginRight: 10 },
  input: {
    flex: 1, color: COLORS.textPrimary,
    fontSize: 13, fontWeight: '700', letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Role tag
  roleTag:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  roleAdmin:  { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  roleGhost:  { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
  roleViewer: { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.25)' },
  roleText:   { fontSize: 8, fontWeight: '900', letterSpacing: 1 },

  // Error / hints
  errorRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  errorText: { color: COLORS.red, fontSize: 10, fontWeight: '600', flex: 1 },
  hintText:  { color: COLORS.textMuted, fontSize: 10, marginBottom: 10, paddingHorizontal: 4, lineHeight: 15 },

  // Prefix badge
  prefixBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 8 },
  prefixBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  // Button
  btn: {
    height: 54, width: '100%', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.cyan, borderRadius: RADIUS.md, ...SHADOW.cyan,
  },
  btnDisabled: { backgroundColor: COLORS.textMuted, shadowOpacity: 0 },
  btnText:     { color: COLORS.bg, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  // Footer
  footer:    { position: 'absolute', bottom: 32, alignItems: 'center' },
  secBadge:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  secText:   { color: COLORS.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  buildText: { color: COLORS.textMuted, fontSize: 9, letterSpacing: 1, fontWeight: '600' },
});

export default LoginScreen;
