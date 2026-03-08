/**
 * AppHeader — Branded top header displayed on Ghost and Login screens.
 * Shows the JOYJET logo with version badge and an optional subtitle.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

const AppHeader = ({ isHub = false }) => {
  if (isHub) {
    // Large centered logo for the Login / splash screen
    return (
      <View style={styles.hubContainer}>
        <MaterialCommunityIcons name="shield-crown-outline" size={44} color={COLORS.cyan} />
        <Text style={styles.hubBrand}>JOY<Text style={styles.hubBrandAccent}>JET</Text></Text>
        <Text style={styles.hubTagline}>◈ MASTER SURVEILLANCE PLATFORM ◈</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v{APP_VERSION} SECURE</Text>
        </View>
      </View>
    );
  }

  // Compact inline header for Ghost screen
  return (
    <View style={styles.inlineContainer}>
      <MaterialCommunityIcons name="shield-crown-outline" size={18} color={COLORS.cyan} style={{ marginRight: 8 }} />
      <Text style={styles.inlineBrand}>JOY<Text style={styles.inlineBrandAccent}>JET</Text></Text>
      <View style={styles.inlineBadge}>
        <Text style={styles.inlineBadgeText}>GHOST NODE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // -- Hub (large) variant --
  hubContainer: { alignItems: 'center', paddingVertical: 10 },
  hubBrand: { color: COLORS.textPrimary, fontSize: 40, fontWeight: '900', letterSpacing: 8, marginTop: 8 },
  hubBrandAccent: { color: COLORS.cyan },
  hubTagline: { color: COLORS.textMuted, fontSize: 10, letterSpacing: 2, fontWeight: '600', marginTop: 6 },
  versionBadge: { marginTop: 12, backgroundColor: 'rgba(56,189,248,0.08)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  versionText: { color: COLORS.cyan, fontSize: 9, fontWeight: '800', letterSpacing: 2 },

  // -- Inline (compact) variant --
  inlineContainer: { flexDirection: 'row', alignItems: 'center' },
  inlineBrand: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900', letterSpacing: 3, marginRight: 10 },
  inlineBrandAccent: { color: COLORS.cyan },
  inlineBadge: { backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  inlineBadgeText: { color: COLORS.cyan, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
});

export default AppHeader;
