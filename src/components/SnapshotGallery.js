import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal } from 'react-native';

const SnapshotGallery = ({ ghostName, snapshots = [] }) => {
  const [selectedSnap, setSelectedSnap] = useState(null);

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
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setSelectedSnap(null)}
        >
          <Image source={{ uri: selectedSnap }} style={styles.fullImage} resizeMode="contain" />
        </TouchableOpacity>
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '80%' }
});

export default SnapshotGallery;
