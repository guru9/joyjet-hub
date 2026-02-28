import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import socket from '../services/socket';

const LoginScreen = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for Server Auth Response
  useEffect(() => {
    socket.on('auth_response', (response) => {
      setLoading(false);
      
      if (response.success) {
        // success: true, role: 'admin' | 'viewer' | 'ghost', allowedNodes: []
        onLogin(response.role, id.trim(), response.allowedNodes);
      } else {
        Alert.alert(
          "Access Denied", 
          response.message || "Invalid credentials for this node."
        );
      }
    });

    return () => socket.off('auth_response');
  }, [id]);

  const handleInitialization = () => {
    if (id.trim().length < 3) {
      return Alert.alert("Validation", "Identifier must be at least 3 characters.");
    }

    setLoading(true);

    // 📡 SEND TO SERVER.JS FOR VERIFICATION
    socket.emit('request_auth', { 
      id: id.trim(), 
      key: key.trim() 
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>JOYJET / NODE</Text>
        
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>NODE IDENTIFIER</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Alpha_01"
            placeholderTextColor="#222"
            value={id}
            onChangeText={setId}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>SERVER ACCESS KEY</Text>
          <TextInput 
            style={styles.input}
            placeholder="REQUIRED FOR ADMIN/VIEWER"
            placeholderTextColor="#222"
            secureTextEntry
            value={key}
            onChangeText={setKey}
          />
        </View>

        <TouchableOpacity 
          style={[styles.btn, loading && { opacity: 0.5 }]} 
          onPress={handleInitialization}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#00ff00" />
          ) : (
            <Text style={styles.btnText}>INITIALIZE CONNECTION</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>NODE v4.2.0-STABLE</Text>
          <Text style={styles.encryption}>SSL / AES-256 TUNNEL ACTIVE</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', padding: 40 },
  logo: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    letterSpacing: 6, 
    textAlign: 'center', 
    marginBottom: 60 
  },
  inputWrapper: { marginBottom: 30 },
  label: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  input: { 
    backgroundColor: '#050505', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1a1a1a', 
    color: '#00ff00', 
    paddingVertical: 12, 
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  btn: { 
    backgroundColor: '#0a0a0a', 
    borderWidth: 1, 
    borderColor: '#333', 
    padding: 18, 
    borderRadius: 4, 
    alignItems: 'center', 
    marginTop: 20 
  },
  btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 3, fontSize: 12 },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  version: { color: '#222', fontSize: 10, marginBottom: 4 },
  encryption: { color: '#111', fontSize: 8, fontWeight: 'bold' }
});

export default LoginScreen;
