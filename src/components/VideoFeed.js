import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
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

    // Listen for signaling data from the Ghost Node
    socket.on('webrtc_signal', async (data) => {
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
    });

    setPc(peerConnection);

    return () => {
      peerConnection.close();
      socket.off('webrtc_signal');
    };
  }, [ghostName]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LIVE FEED: {ghostName}</Text>
      
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.rtcView}
          objectFit="contain"
          zOrder={1}
        />
      ) : (
        <View style={styles.placeholder}>
          <ActivityIndicator color="#00ff00" size="small" />
          <Text style={styles.statusText}>
            {connecting ? "ESTABLISHING SECURE TUNNEL..." : "FEED INTERRUPTED"}
          </Text>
        </View>
      )}
      
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>REC ● 1080p</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#050505',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#111',
    marginVertical: 10,
  },
  label: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: '#333',
    fontSize: 9,
    fontWeight: 'bold',
    zIndex: 10,
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
  },
  statusText: {
    color: '#222',
    fontSize: 10,
    marginTop: 10,
    letterSpacing: 2
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2
  },
  overlayText: {
    color: '#ff0000',
    fontSize: 8,
    fontWeight: 'bold'
  }
});

export default VideoFeed;
