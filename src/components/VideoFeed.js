import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import socket from '../services/socket';

const VideoFeed = ({ ghostName, adminName }) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [pc, setPc] = useState(null);

  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const target = adminName ? 'admin' : ghostName.split('_')[0].toLowerCase();
        socket.emit('relay_ice_candidate', {
          from: ghostName,
          target: target,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setConnecting(false);
      }
    };

    const handleSignal = async (data) => {
      if (data.from !== ghostName) return;

      if (data.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('send_answer', {
          viewerName: adminName || ghostName.split('_')[0],
          targetGhost: ghostName,
          answer: answer
        });
      } else if (data.type === 'candidate') {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ICE candidate", e);
        }
      }
    };

    socket.on('webrtc_signal', handleSignal);

    setPc(peerConnection);

    // Initial timeout to handle failed connections without getting stuck spinning
    const connectionTimeout = setTimeout(() => {
      if (!remoteStream && connecting) {
        setConnecting(false);
      }
    }, 15000); // 15 seconds wait max

    return () => {
      clearTimeout(connectionTimeout);
      peerConnection.close();
      socket.off('webrtc_signal', handleSignal);
    };
  }, [ghostName]);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View style={remoteStream ? styles.dotGreen : styles.dotOrange} />
        <Text style={styles.label}>LIVE STREAM: {ghostName}</Text>
      </View>
      
      {remoteStream ? (
        <>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.rtcView}
            objectFit="cover"
            zOrder={1}
          />
          <View style={styles.overlay}>
            <MaterialCommunityIcons name="record-circle-outline" size={12} color="#EF4444" style={{marginRight: 4}} />
            <Text style={styles.overlayText}>REC • 1080p</Text>
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          {connecting ? (
            <>
              <ActivityIndicator color="#38BDF8" size="large" />
              <Text style={styles.statusText}>ESTABLISHING SECURE TUNNEL...</Text>
              <Text style={styles.subText}>Negotiating peer connection</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="video-off" size={48} color="#334155" />
              <Text style={styles.statusText}>FEED UNAVAILABLE</Text>
              <Text style={styles.subText}>The ghost node stream could not be established</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  labelContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  dotOrange: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', marginRight: 6 },
  label: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },
  rtcView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A'
  },
  statusText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 1
  },
  subText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 6
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  overlayText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});

export default VideoFeed;
