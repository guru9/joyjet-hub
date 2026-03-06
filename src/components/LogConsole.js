import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LogConsole = ({ logs }) => {
  const flatListRef = useRef();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="console-network-outline" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
        <Text style={styles.header}>LIVE SYSTEM LOGS</Text>
      </View>
      <View style={styles.logBox}>
        <FlatList
          ref={flatListRef}
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => {
            const isCall = item.message.includes('CALL:');
            const isBattery = item.message.includes('Battery');
            const isSystem = item.type === 'SYSTEM';
            
            return (
              <View style={styles.logRow}>
                <Text style={styles.timestamp}>[{item.timestamp}]</Text>
                <Text style={[
                  styles.message, 
                  isCall ? styles.callText : (isBattery ? styles.batteryText : (isSystem ? styles.systemText : styles.normalText))
                ]}>
                  {item.message}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  header: { color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  logBox: { flex: 1, backgroundColor: '#0F172A', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#1E293B' },
  logRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  timestamp: { color: '#64748B', fontSize: 10, fontFamily: 'monospace', marginRight: 10, paddingTop: 1 },
  message: { fontSize: 11, fontFamily: 'monospace', flex: 1, flexWrap: 'wrap', lineHeight: 16 },
  normalText: { color: '#F8FAFC' },
  systemText: { color: '#38BDF8', fontWeight: '500' },
  callText: { color: '#F59E0B', fontWeight: '600' },
  batteryText: { color: '#10B981' }
});

export default LogConsole;
