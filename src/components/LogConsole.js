import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const LogConsole = ({ logs }) => {
  const flatListRef = useRef();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SYSTEM LOGS</Text>
      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(item, index) => index.toString()}
        // Auto-scroll to bottom when content changes
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={styles.logLine}>
            <Text style={styles.timestamp}>[{item.timestamp}]</Text>
            <Text style={[
                styles.message, 
                { color: item.type === 'ERROR' ? '#ff4444' : '#00ff00' }
            ]}>
              {item.message}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 180, backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: '#333', padding: 10 },
  title: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  logLine: { flexDirection: 'row', marginBottom: 2 },
  timestamp: { color: '#444', fontSize: 10, marginRight: 8, fontFamily: 'monospace' },
  message: { fontSize: 11, fontFamily: 'monospace' }
});

export default LogConsole;
