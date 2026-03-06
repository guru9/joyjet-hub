import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const SnapshotGallery = ({ ghostName, snapshots = [] }) => {
  const [selectedSnap, setSelectedSnap] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSnap = async (uri) => {
    try {
      setIsDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "Storage access is required to save snapshots.");
        return;
      }

      // 1. Create a temp file path (Base64 can be long, so we save to file first)
      const filename = `GHOST_SNAP_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      // 2. Write the base64 data to a file (ViewShot URI is usually base64 or file: on Android)
      // If it's already a file URI from view-shot, we can skip writing
      let sourceUri = uri;
      if (uri.startsWith('data:')) {
        const base64Content = uri.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Content, { encoding: FileSystem.EncodingType.Base64 });
        sourceUri = fileUri;
      }

      // 3. Save to media library
      const asset = await MediaLibrary.createAssetAsync(sourceUri);
      await MediaLibrary.createAlbumAsync('JOYJET_SNAPS', asset, false);
      
      Alert.alert("Success", "Evidence saved to gallery (Album: JOYJET_SNAPS)");
    } catch (err) {
      console.error("[Download] Save failed", err);
      Alert.alert("System", "Failed to preserve evidence to local storage.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.snapCard} onPress={() => setSelectedSnap(item.uri)}>
      <Image source={{ uri: item.uri }} style={styles.thumb} />
      <Text style={styles.time}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {snapshots.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>NO SNAPSHOTS CAPTURED FOR {ghostName}</Text>
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
                <Text style={styles.actionBtnTxt}>{isDownloading ? "SAVING..." : "[ DOWNLOAD EVIDENCE ]"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedSnap(null)}>
                <Text style={styles.closeBtnTxt}>CLOSE</Text>
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
  placeholderText: { color: '#222', fontSize: 9, letterSpacing: 1 },
  list: { gap: 10 },
  snapCard: { flex: 1, backgroundColor: '#080808', borderRadius: 4, padding: 5, marginBottom: 10, borderWidth: 1, borderColor: '#111' },
  thumb: { width: '100%', aspectRatio: 9 / 16, borderRadius: 2, backgroundColor: '#000' },
  time: { color: '#00ff00', fontSize: 8, marginTop: 5, textAlign: 'center' },
  
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeArea: { position: 'absolute', width: '100%', height: '100%' },
  modalContent: { width: '90%', height: '90%', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '80%' },
  modalActions: { width: '100%', flexDirection: 'column', gap: 15, marginTop: 20 },
  actionBtn: { width: '100%', height: 50, borderWidth: 1, borderColor: '#00ff00', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00ff0005' },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnTxt: { color: '#00ff00', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  closeBtn: { width: '100%', height: 40, justifyContent: 'center', alignItems: 'center' },
  closeBtnTxt: { color: '#444', fontSize: 10, fontWeight: 'bold' }
});

export default SnapshotGallery;
