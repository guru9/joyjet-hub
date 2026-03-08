import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GuideScreen = ({ onBack }) => {
  const sections = [
    {
      title: "GHOST ACTIVATION",
      icon: "leak",
      color: "#F59E0B",
      items: [
        { label: "INITIAL CALIBRATION", desc: "Open the Ghost app and tap 'CALIBRATE'. This initializes the hardware sensors, GPS pipeline, and encrypted video bridge. The orb will turn blue and pulse when synced." },
        { label: "STEALTH ESCAPE", desc: "Tapping 'GO STEALTH MODE' inside the Ghost app triggers a safe exit to the background. The app remains active in memory, but is hidden from the recent apps list in 'most configurations'." },
        { label: "HARDENED UI", desc: "Ghost nodes have no logout capability. The session is pinned to the device until an Admin remotely issues a 'WIPE' or 'BURN' command." }
      ]
    },
    {
      title: "UPLINK STATUS (TRAFFIC LIGHTS)",
      icon: "traffic-light",
      color: "#10B981",
      items: [
        { label: "🟢 GREEN (OPTIMIZED/CONNECTED)", desc: "Full power. Node is transmitting location every 15s and supporting live video feeds." },
        { label: "🟠 ORANGE (PAUSED/PENDING)", desc: "Power-save mode. WebRTC bridge is closed and GPS polling is suspended. Maintains a 'heartbeat' for reactivation." },
        { label: "🔴 RED (OFFLINE/KILLED)", desc: "Node has lost connection, been manually terminated, or burned from the registry." }
      ]
    },
    {
      title: "ADMIN STRATEGIC CONTROLS",
      icon: "security-network",
      color: "#38BDF8",
      items: [
        { label: "PAUSE/RESUME", desc: "Toggle the 'PAUSE' button to remotely put a node to sleep, saving 80% battery consumption while maintaining the link." },
        { label: "RE-SYNC TELEMETRY", desc: "Use 'RE-SYNC DATA' in the Calls tab to pull the most recent 10 communication logs from the device's internal storage." },
        { label: "EVIDENCE CAPTURE", desc: "Request 'REMOTE SNAP' to trigger a secret silent screenshot on the target. Alternatively, use 'CAPTURE FEED' to save a local copy of the live video." }
      ]
    },
    {
      title: "SECURE BURN PROTOCOL",
      icon: "fire",
      color: "#EF4444",
      items: [
        { label: "PERMANENT DELETION", desc: "Long-press any node in the selection bar for 2 seconds to initiate BURN PROTOCOL. This is the ultimate kill-switch." },
        { label: "DATABASE PURGE", desc: "Confirming the burn removes the node name and identity from the master registry FOREVER. The target app is force-wiped and locked." },
        { label: "CYBER ALERTS", desc: "All system events are funneled through the Hacker-themed UI modal. Watch for Red alerts to identify terminal failures or security breaches." }
      ]
    }
  ];
    
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          
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
              <Text style={styles.heroSub}>JoyJet Hub Secure Infrastructure v4.3.0</Text>
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
                      <Text style={[styles.itemLabel, { color: section.color }]}>{item.label}</Text>
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
      itemLabel: { fontSize: 13, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
      itemDesc: { color: '#94A3B8', fontSize: 11, lineHeight: 18 },
    
      footer: { alignItems: 'center', marginTop: 20, opacity: 0.5 },
      footerText: { color: '#64748B', fontSize: 9, fontWeight: '700', letterSpacing: 1 }
    });

export default GuideScreen;
