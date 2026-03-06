import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TacticalMap = ({ location, ghostName }) => {
  if (!location || !location.lat) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <MaterialCommunityIcons name="map-marker-off" size={48} color="#334155" />
        <Text style={styles.emptyText}>LOCATION DATA UNAVAILABLE</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker 
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          title={ghostName}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerRadar} />
            <MaterialCommunityIcons name="target" size={24} color="#38BDF8" />
          </View>
        </Marker>
      </MapView>
    </View>
  );
};

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748B" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0F172A" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] }
];

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A'
  },
  emptyText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerRadar: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)'
  }
});

export default TacticalMap;
