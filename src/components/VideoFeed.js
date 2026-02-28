import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import socket from '../services/socket';

const VideoFeed = ({ ghostName }) => {
  const [frame, setFrame] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Listen for the specific frame event for this ghost
    const frameEvent = `stream_frame_${ghostName}`;
    
    socket.on(frameEvent, (data) => {
      setFrame(data.image); // data.image is the Base64 string
      setIsLive(true);
      setLastUpdate(Date.now());
    });

    // Check if the stream has frozen (no frames for 3 seconds)
    const watchdog = setInterval(() => {
      if (Date.now() - lastUpdate > 3000) {
        setIsLive(false);
      }
    }, 2000);

    return () => {
      socket.off(frameEvent);
      clearInterval(watchdog);
    };
  }, [ghostName, lastUpdate]);

  return (
    <View style={styles.container}>
      {frame && isLive ? (
        <Image 
          source={{ uri: `data:image/jpeg;base64,${frame}` }} 
          style={styles.video}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <ActivityIndicator color="#00ff00" />
          <Text style={styles.waitText}>WAITING FOR HD FEED...</Text>
        </View>
      )}
      
      {/* Live Indicator Overlay */}
      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.redDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  waitText: {
    color: '#333',
    fontSize: 10,
    marginTop: 10,
    letterSpacing: 1,
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff0000',
    marginRight: 5,
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default VideoFeed;
