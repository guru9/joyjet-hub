import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';

export default function ExitManager({ onLogout, label = "EXIT", styleType = "default" }) {
  
  const triggerExit = () => {
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to disconnect from the session?",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Confirm Exit", 
          onPress: onLogout, 
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.baseBtn, styleType === "admin" ? styles.adminBtn : styles.viewerBtn]} 
      onPress={triggerExit}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  adminBtn: { backgroundColor: '#333', borderWidth: 1, borderColor: '#FF0000' },
  viewerBtn: { backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#666' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }
});
