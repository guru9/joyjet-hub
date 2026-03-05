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
        <Text style={[styles.brand, styles.hubLogo]}>{title} HUB</Text>
        <Text style={styles.hubSubtitle}>BATTERY OPTIMIZER AI v{APP_VERSION}</Text>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Text style={styles.brand}>{title} // {subTitle}</Text>
      <Text style={styles.version}>v{APP_VERSION}{versionSuffix}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  brand: { color: '#fff', fontSize: 16, letterSpacing: 8, fontWeight: 'bold' },
  version: { color: '#222', fontSize: 9, marginTop: 5 },
  hubLogo: { fontSize: 28, marginBottom: 5 },
  hubSubtitle: { color: '#444', fontSize: 10, marginBottom: 50, letterSpacing: 2 },
});


export default AppHeader;
