import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CallLogViewer = ({ logs = [] }) => {
  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={item.type === 'INCOMING' ? 'phone-incoming' : 'phone-outgoing'} 
          size={20} 
          color={item.type === 'INCOMING' ? '#10B981' : '#38BDF8'} 
        />
      </View>
      <View style={styles.left}>
        <Text style={styles.name}>{item.name || 'UNKNOWN NUMBER'}</Text>
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
        <MaterialCommunityIcons name="history" size={16} color="#38BDF8" style={{ marginRight: 6 }} />
        <Text style={styles.headerText}>TELEMETRY: CALL_LOG_SYNC</Text>
      </View>
      {logs.length === 0 ? (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="phone-off" size={32} color="#334155" />
          <Text style={styles.placeholderText}>NO CALL RECORDS SYNCED</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: 10, marginBottom: 12 },
  headerText: { color: '#38BDF8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  list: { paddingBottom: 20 },
  logItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#1E293B', marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  left: { flex: 1 },
  name: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  number: { color: '#94A3B8', fontSize: 12 },
  right: { alignItems: 'flex-end' },
  type: { fontSize: 10, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  in: { color: '#10B981' },
  out: { color: '#38BDF8' },
  date: { color: '#64748B', fontSize: 10 },
  placeholder: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#1E293B' },
  placeholderText: { color: '#64748B', fontSize: 11, marginTop: 10, fontWeight: '600', letterSpacing: 1 }
});

export default CallLogViewer;
