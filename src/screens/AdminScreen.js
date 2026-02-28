import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AdminScreen({ socket, user, onExit }) {
    const [feed, setFeed] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [statusMsg, setStatusMsg] = useState("AWAITING HD SIGNAL...");

    useEffect(() => {
        // --- HIGH-QUALITY FRAME RECEIVER ---
        socket.on('screen_frame', (data) => {
            // data: { ghostName: "Alpha_01", frame: "base64..." }
            setFeed(`data:image/jpeg;base64,${data.frame}`);
            setStatusMsg(`LIVE: ${data.ghostName.toUpperCase()}`);
        });

        socket.on('system_alert', (data) => {
            Alert.alert("System", data.msg);
        });

        return () => {
            socket.off('screen_frame');
            socket.off('system_alert');
        };
    }, []);

    const toggleVisibility = () => {
        const nextState = !isOffline;
        setIsOffline(nextState);
        socket.emit('toggle_visibility', { hidden: nextState });
    };

    const confirmExit = () => {
        Alert.alert("Terminate Session", "Disconnect from Joyjet Hub?", [
            { text: "Stay", style: "cancel" },
            { text: "Logout", onPress: onExit }
        ]);
    };

    const triggerWipe = () => {
        Alert.alert("DANGER", "This will force the target node to open settings for uninstallation. Proceed?", [
            { text: "Cancel" },
            { text: "WIPE NODE", onPress: () => socket.emit('admin_wipe', 'GLOBAL_BROADCAST'), style: 'destructive' }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* --- HEADER: Identity & Status --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.roleTag}>{user.role}</Text>
                    <Text style={styles.nameTag}>{user.name.toUpperCase()}</Text>
                </View>
                
                <TouchableOpacity 
                    style={[styles.statusBadge, { backgroundColor: isOffline ? '#333' : '#00ffcc' }]} 
                    onPress={toggleVisibility}
                >
                    <Text style={styles.statusLabel}>{isOffline ? "STEALTH" : "LIVE HUB"}</Text>
                </TouchableOpacity>
            </View>

            {/* --- MONITOR: HD Video Feed --- */}
            <View style={styles.monitorFrame}>
                {feed ? (
                    <Image 
                        source={{ uri: feed }} 
                        style={styles.liveImage} 
                        fadeDuration={0} // Critical: Removes lag between frames
                    />
                ) : (
                    <View style={styles.noSignal}>
                        <Text style={styles.noSignalText}>{statusMsg}</Text>
                    </View>
                )}
            </View>

            {/* --- FOOTER: Controls & Exit --- */}
            <View style={styles.footer}>
                <View style={styles.commandRow}>
                    {user.role === 'ADMIN' ? (
                        <TouchableOpacity style={styles.wipeBtn} onPress={triggerWipe}>
                            <Text style={styles.wipeText}>REMOTE WIPE</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.viewerHint}>Monitoring assigned child-nodes only</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={confirmExit}>
                    <Text style={styles.logoutText}>TERMINATE LINK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#111' },
    roleTag: { color: '#444', fontSize: 9, fontWeight: 'bold', letterSpacing: 2 },
    nameTag: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 3 },
    statusLabel: { color: '#000', fontSize: 10, fontWeight: 'bold' },
    monitorFrame: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
    liveImage: { width: width, height: '100%', resizeMode: 'contain' },
    noSignal: { alignItems: 'center' },
    noSignalText: { color: '#1a1a1a', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    footer: { padding: 30, borderTopWidth: 1, borderColor: '#111' },
    commandRow: { marginBottom: 25, alignItems: 'center' },
    wipeBtn: { borderWidth: 1, borderColor: '#ff0033', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 5 },
    wipeText: { color: '#ff0033', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    viewerHint: { color: '#222', fontSize: 9, fontStyle: 'italic' },
    logoutBtn: { alignSelf: 'center', padding: 10 },
    logoutText: { color: '#555', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});
