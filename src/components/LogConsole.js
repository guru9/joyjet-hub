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
  container: { height: 200, backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: '#1a1a1a', padding: 10 },
  header: { color: '#333', fontSize: 9, fontWeight: 'bold', marginBottom: 8, letterSpacing: 2 },
  logRow: { flexDirection: 'row', marginBottom: 4 },
  timestamp: { color: '#222', fontSize: 10, fontFamily: 'monospace', marginRight: 10 },
  message: { fontSize: 11, fontFamily: 'monospace', flex: 1 },
  normalText: { color: '#00ff00' },
  callText: { color: '#ffcc00', fontWeight: 'bold' }, // Golden highlight for Calls
  batteryText: { color: '#00ccff' } // Teal highlight for battery
});

export default LogConsole;
