import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

const AppHeader = ({ 
  title = "JOYJET", 
  subTitle = "OPTIMIZER", 
  versionSuffix = "-STABLE",
  isHub = false 
}) => {
  if (isHub) {
    return (
      <View style={styles.header}>
        <Text style={[styles.brand, styles.hubLogo]}>{title} <Text style={styles.highlight}>HUB</Text></Text>
        <Text style={styles.hubSubtitle}>BATTERY OPTIMIZER AI v{APP_VERSION}</Text>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Text style={styles.brand}>{title} <Text style={styles.divider}>//</Text> {subTitle}</Text>
      <View style={styles.versionBadge}>
        <Text style={styles.version}>v{APP_VERSION}{versionSuffix}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 10 },
  brand: { color: '#F8FAFC', fontSize: 18, letterSpacing: 4, fontWeight: '800' },
  highlight: { color: '#38BDF8' },
  divider: { color: '#334155', marginHorizontal: 8 },
  versionBadge: { backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#334155' },
  version: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  hubLogo: { fontSize: 32, marginBottom: 8, letterSpacing: 6 },
  hubSubtitle: { color: '#94A3B8', fontSize: 12, marginBottom: 40, letterSpacing: 3, fontWeight: '500' },
});

export default AppHeader;
