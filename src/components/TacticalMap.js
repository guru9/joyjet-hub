import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const TacticalMap = ({ location, ghostName }) => {
  if (!location || !location.lat) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker 
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          title={ghostName}
        />
      </MapView>
    </View>
  );
};

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#303030" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#111'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TacticalMap;
