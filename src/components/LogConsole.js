import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const LogConsole = ({ logs }) => {
  const flatListRef = useRef();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LIVE SYSTEM LOGS</Text>
      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        renderItem={({ item }) => {
          const isCall = item.message.includes('CALL:');
          const isBattery = item.message.includes('Battery');
          
          return (
            <View style={styles.logRow}>
              <Text style={styles.timestamp}>[{item.timestamp}]</Text>
              <Text style={[
                styles.message, 
                isCall ? styles.callText : (isBattery ? styles.batteryText : styles.normalText)
              ]}>
                {item.message}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', paddingVertical: 10 },
  header: { color: '#333', fontSize: 9, fontWeight: 'bold', marginBottom: 8, letterSpacing: 2 },
  logRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  timestamp: { color: '#222', fontSize: 9, fontFamily: 'monospace', marginRight: 8, paddingTop: 1 },
  message: { fontSize: 10, fontFamily: 'monospace', flex: 1, flexWrap: 'wrap' },
  normalText: { color: '#00ff00' },
  callText: { color: '#ffcc00', fontWeight: 'bold' },
  batteryText: { color: '#00ccff' }
});

export default LogConsole;
