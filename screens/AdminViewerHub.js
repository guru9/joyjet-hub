import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import io from 'socket.io-client';

const socket = io('https://your-server.onrender.com');

export default function AdminViewerHub({ role, userName }) {
  const [img, setImg] = useState(null);
  const [timer, setTimer] = useState(300);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    socket.emit('register', { role, name: userName });
    
    socket.on('stream', (data) => setImg(data));
    socket.on('hub_error', (msg) => Alert.alert("Access Denied", msg));

    let clock;
    if (isLive && timer > 0) {
      clock = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsLive(false);
    }
    return () => clearInterval(clock);
  }, [isLive, timer]);

  const cmd = (type) => {
    if (role !== 'admin') return;
    if (type === 'LIVE') { setIsLive(true); setTimer(300); }
    socket.emit('admin_cmd', type);
  };

  return (
    <View style={styles.main}>
      <Text style={styles.head}>SYSTEM: {role.toUpperCase()}</Text>
      {isLive && <Text style={styles.timer}>WINDOW: {Math.floor(timer/60)}:{timer%60}</Text>}
      
      <View style={styles.box}>
        {img ? <Image source={{uri: `data:image/jpeg;base64,${img}`}} style={styles.full} /> : <Text style={{color: '#333'}}>SIGNAL LOST</Text>}
      </View>

      {role === 'admin' && (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => cmd('LIVE')} style={styles.btn}><Text style={styles.txt}>LIVE</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => cmd('WIPE')} style={styles.btnR}><Text style={styles.txt}>WIPE</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000', padding: 20 },
  head: { color: '#0f0', textAlign: 'center', marginTop: 20 },
  timer: { color: '#fff', textAlign: 'center', fontSize: 20, margin: 10 },
  box: { flex: 1, backgroundColor: '#0a0a0a', borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  full: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  btn: { backgroundColor: '#111', padding: 15, borderRadius: 5, borderWidth: 1, borderColor: '#0f0' },
  btnR: { backgroundColor: '#200', padding: 15, borderRadius: 5 },
  txt: { color: '#fff', fontWeight: 'bold' }
});
