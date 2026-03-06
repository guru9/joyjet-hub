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
      Alert.alert("System Error", "Failed to preserve evidence.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.snapCard} onPress={() => setSelectedSnap(item.uri)}>
      <Image source={{ uri: item.uri }} style={styles.thumb} />
      <View style={styles.cardFooter}>
        <View style={styles.timeTag}>
          <MaterialCommunityIcons name="clock-outline" size={10} color="#94A3B8" style={{marginRight: 4}}/>
          <Text style={styles.time}>{item.timestamp}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-expand-all" size={14} color="#38BDF8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {snapshots.length === 0 ? (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="camera-off" size={48} color="#334155" />
          <Text style={styles.placeholderText}>NO SNAPSHOTS DETECTED</Text>
        </View>
      ) : (
        <FlatList
          data={snapshots}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
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
                  <ActivityIndicator color="#1E293B" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="download" size={20} color="#1E293B" style={{ marginRight: 8 }} />
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
  placeholder: { height: 250, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#1E293B' },
  placeholderText: { color: '#64748B', fontSize: 11, letterSpacing: 1.5, marginTop: 16, fontWeight: '600' },
  list: { paddingBottom: 20 },
  row: { gap: 12, marginBottom: 12 },
  snapCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 6, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  thumb: { width: '100%', aspectRatio: 3 / 4, borderRadius: 6, backgroundColor: '#0F172A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingHorizontal: 4, paddingBottom: 4 },
  timeTag: { flexDirection: 'row', alignItems: 'center' },
  time: { color: '#94A3B8', fontSize: 10, fontWeight: '500' },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center' },
  closeArea: { position: 'absolute', width: '100%', height: '100%' },
  modalContent: { width: '90%', height: '85%', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '75%', borderRadius: 12 },
  modalActions: { width: '100%', gap: 12, marginTop: 24, paddingHorizontal: 20 },
  actionBtn: { width: '100%', height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 25, backgroundColor: '#38BDF8', shadowColor: '#38BDF8', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  actionBtnDisabled: { opacity: 0.7, backgroundColor: '#64748B', shadowOpacity: 0 },
  actionBtnTxt: { color: '#1E293B', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  closeBtn: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 25, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1E293B' },
  closeBtnTxt: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', letterSpacing: 1 }
});

export default SnapshotGallery;
