import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const CallLogViewer = ({ logs = [] }) => {
  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.left}>
        <Text style={styles.name}>{item.name || 'UNKNOWN'}</Text>
        <Text style={styles.number}>{item.phoneNumber}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.type, item.type === 'INCOMING' ? styles.in : styles.out]}>{item.type}</Text>
        <Text style={styles.date}>{item.dateTime}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>TELEMETRY: CALL_LOG_SYNC</Text>
      </View>
      {logs.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>NO CALL RECORDS SYNCED</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  header: { borderBottomWidth: 1, borderBottomColor: '#00ff0022', paddingBottom: 5, marginBottom: 10 },
  headerText: { color: '#00ff00', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  list: { paddingBottom: 20 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#050505', marginBottom: 5, borderRadius: 4, borderWidth: 1, borderColor: '#111' },
  name: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  number: { color: '#666', fontSize: 10, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  type: { fontSize: 8, fontWeight: 'bold', marginBottom: 4 },
  in: { color: '#00ff00' },
  out: { color: '#ff4444' },
  date: { color: '#333', fontSize: 8 },
  placeholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#222', fontSize: 9 }
});

export default CallLogViewer;
