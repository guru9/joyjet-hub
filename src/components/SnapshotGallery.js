import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const SnapshotGallery = ({ ghostName, snapshots = [] }) => {
  const [selectedSnap, setSelectedSnap] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear().toString().slice(-2)}`;
  };

  const downloadSnap = async (uri) => {
    try {
      setIsDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "Storage access is required to save snapshots.");
        return;
      }

      // Tactical Filename: GHOST_TIME_DATE.jpg
      const cleanGhostName = ghostName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      const filename = `${cleanGhostName}_${getFormattedTimestamp()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      let sourceUri = uri;
      if (uri.startsWith('data:')) {
        const base64Content = uri.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Content, { encoding: FileSystem.EncodingType.Base64 });
        sourceUri = fileUri;
      }

      const asset = await MediaLibrary.createAssetAsync(sourceUri);
      await MediaLibrary.createAlbumAsync('JOYJET_DOWNLOADS', asset, false);
      
      Alert.alert("Success", `Evidence preserved: ${filename}`);
    } catch (err) {
      console.error("[Download] Save failed", err);
      Alert.alert("System", "Failed to preserve evidence.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.snapCard} onPress={() => setSelectedSnap(item.uri)}>
      <Image source={{ uri: item.uri }} style={styles.thumb} />
      <View style={styles.cardFooter}>
        <Text style={styles.time}>{item.timestamp}</Text>
        <MaterialCommunityIcons name="eye-outline" size={12} color="#00ff00" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {snapshots.length === 0 ? (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="image-off-outline" size={40} color="#111" />
          <Text style={styles.placeholderText}>NO SNAPSHOTS DETECTED</Text>
        </View>
      ) : (
        <FlatList
          data={snapshots}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={!!selectedSnap} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.closeArea} 
            onPress={() => setSelectedSnap(null)}
          />
          
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedSnap }} style={styles.fullImage} resizeMode="contain" />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, isDownloading && styles.actionBtnDisabled]} 
                onPress={() => downloadSnap(selectedSnap)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator color="#00ff00" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-download-outline" size={20} color="#00ff00" style={{ marginRight: 10 }} />
                    <Text style={styles.actionBtnTxt}>DOWNLOAD EVIDENCE</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedSnap(null)}>
                <Text style={styles.closeBtnTxt}>CLOSE PREVIEW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  placeholder: { height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', borderRadius: 4, borderWidth: 1, borderColor: '#111' },
  placeholderText: { color: '#222', fontSize: 9, letterSpacing: 2, marginTop: 10 },
  list: { gap: 10 },
  snapCard: { flex: 1, backgroundColor: '#080808', borderRadius: 4, padding: 5, marginBottom: 10, borderWidth: 1, borderColor: '#111' },
  thumb: { width: '100%', aspectRatio: 9 / 16, borderRadius: 2, backgroundColor: '#000' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, paddingHorizontal: 2 },
  time: { color: '#00ff00', fontSize: 8 },
  
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center' },
  closeArea: { position: 'absolute', width: '100%', height: '100%' },
  modalContent: { width: '90%', height: '90%', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '70%' },
  modalActions: { width: '100%', gap: 10, marginTop: 30 },
  actionBtn: { width: '100%', height: 50, borderWidth: 1, borderColor: '#00ff00', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 5, backgroundColor: '#00ff0005' },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnTxt: { color: '#00ff00', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  closeBtn: { width: '100%', height: 40, justifyContent: 'center', alignItems: 'center' },
  closeBtnTxt: { color: '#444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }
});

export default SnapshotGallery;
