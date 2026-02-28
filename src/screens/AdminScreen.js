import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import socket from '../services/socket';
import StatusCard from './components/StatusCard';
import LogConsole from './components/LogConsole';

const AdminScreen = () => {
  const [ghosts, setGhosts] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('heartbeat_update', (data) => {
      setGhosts(prev => ({ ...prev, [data.name]: data }));
    });

    socket.on('log_update', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 15));
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>GURU COMMAND</Text>
      
      <ScrollView style={styles.ghostList}>
        {Object.values(ghosts).map(ghost => (
          <View key={ghost.name} style={styles.ghostBox}>
            <Text style={styles.ghostName}>{ghost.name}</Text>
            
            {/* Using the Child Component */}
            <StatusCard 
                battery={ghost.battery} 
                connection={ghost.connection} 
                isCharging={ghost.isCharging} 
            />

            <View style={styles.videoPlaceholder}>
               <Text style={{color: '#444'}}>STREAMING...</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Using the Log Console Child */}
      <LogConsole logs={logs} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { color: '#fff', textAlign: 'center', marginTop: 50, fontSize: 18, fontWeight: 'bold' },
  ghostList: { padding: 15 },
  ghostBox: { marginBottom: 20, backgroundColor: '#111', padding: 10, borderRadius: 10 },
  ghostName: { color: '#fff', marginBottom: 5, fontSize: 14 },
  videoPlaceholder: { height: 150, backgroundColor: '#050505', marginTop: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }
});

export default AdminScreen;
