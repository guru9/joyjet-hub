/**
 * LogConsole — Scrolling terminal log viewer.
 * Auto-scrolls to newest entry.
 * Color-codes entries by type: SYSTEM (cyan), CALL (amber), ERROR (red), default (white).
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

const LogConsole = ({ logs = [], title = 'SYSTEM LOGS' }) => {
  const listRef = useRef();

  return (
    <View style={styles.container}>
      {/* Console title bar */}
      <View style={styles.titleBar}>
        <MaterialCommunityIcons name="console-network-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.dot} />
      </View>

      {/* Log lines */}
      <View style={styles.logBox}>
        <FlatList
          ref={listRef}
          data={logs}
          keyExtractor={(_, i) => i.toString()}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <LogLine item={item} />}
          ListEmptyComponent={<Text style={styles.empty}>// AWAITING DATA STREAM...</Text>}
        />
      </View>
    </View>
  );
};

// Individual log line — color determined by content/type
const LogLine = ({ item }) => {
  const { color } = resolveStyle(item);
  return (
    <View style={styles.row}>
      <Text style={styles.ts}>[{item.timestamp}]</Text>
      <Text style={[styles.msg, { color }]}>{item.message}</Text>
    </View>
  );
};

const resolveStyle = (item) => {
  if (item.type === 'ERROR' || item.message?.includes('ERROR')) return { color: COLORS.red };
  if (item.type === 'SYSTEM')                                   return { color: COLORS.cyan };
  if (item.message?.includes('CALL:'))                         return { color: COLORS.amber };
  if (item.message?.includes('Battery') || item.message?.includes('BATTERY')) return { color: COLORS.green };
  return { color: COLORS.textPrimary };
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  titleBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  titleText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2, flex: 1 },
  dot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },

  logBox: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.borderFaint, minHeight: 120 },

  row: { flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' },
  ts:  { color: COLORS.textMuted, fontSize: 9, fontFamily: 'monospace', marginRight: 8, paddingTop: 1, minWidth: 70 },
  msg: { fontSize: 10, fontFamily: 'monospace', flex: 1, lineHeight: 15 },

  empty: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace', padding: 4 },
});

export default LogConsole;
