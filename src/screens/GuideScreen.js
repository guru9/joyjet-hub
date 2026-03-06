import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GuideScreen = ({ onBack }) => {
  const sections = [
    {
      title: "TACTICAL INTERFACE",
      icon: "view-grid-plus-outline",
      color: "#F59E0B",
      items: [
        { label: "VITALS GRID", desc: "2x2 high-density display of node identity, power, uplink, and telemetry age." },
        { label: "AUTO-SYNC", desc: "Node data is automatically refreshed on selection via background signaling." }
      ]
    },
    {
      title: "CONNECTION ARCHITECTURE",
      icon: "lan-connect",
      color: "#38BDF8",
      items: [
        { label: "UNIFIED ROUTING", desc: "All node IDs are normalized to lowercase for universal reliability." },
        { label: "SECURE TUNNEL", desc: "Encrypted WebRTC streams with 15s handshake timeout protection." }
      ]
    },
    {
      title: "COMMAND PROTOCOLS",
      icon: "console-line",
      color: "#10B981",
      items: [
        { label: "REMOTE SNAP", desc: "Request a high-resolution screen capture from any active node." },
        { label: "WIPE SESSION", desc: "Remotely terminate and purge ghost node memory sessions." }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#38BDF8" />
          <Text style={styles.backTxt}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HUB GUIDE</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <MaterialCommunityIcons name="book-open-variant" size={48} color="#38BDF8" />
          <Text style={styles.heroTitle}>OPERATIONAL MANUAL</Text>
          <Text style={styles.heroSub}>JoyJet Hub Secure Infrastructure v4.0.0</Text>
        </View>

        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name={section.icon} size={20} color={section.color} />
              <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
            </View>
            <View style={styles.card}>
              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={[styles.item, iIdx < section.items.length - 1 && styles.border]}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ENCRYPTED PROTOCOL 2026 • JOYJET SYSTEMS</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 60 },
  backTxt: { color: '#38BDF8', fontSize: 12, fontWeight: '700', marginLeft: -4 },
  headerTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  content: { flex: 1, padding: 20 },
  hero: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  heroTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginTop: 12 },
  heroSub: { color: '#64748B', fontSize: 12, marginTop: 4, fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingLeft: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginLeft: 8 },
  
  card: { backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  item: { padding: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: '#273549' },
  itemLabel: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  itemDesc: { color: '#94A3B8', fontSize: 11, lineHeight: 16 },

  footer: { alignItems: 'center', marginTop: 20, opacity: 0.5 },
  footerText: { color: '#64748B', fontSize: 9, fontWeight: '700', letterSpacing: 1 }
});

export default GuideScreen;
