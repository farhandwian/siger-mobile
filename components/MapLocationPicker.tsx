import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Types
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationValue extends LatLng {
  address?: string;
}

interface Props {
  value?: LocationValue;
  onChange: (val: LocationValue) => void;
  errorText?: string;
  initialRegion?: Region;
  showMyLocationButton?: boolean;
  height?: number;
}

export default function MapLocationPicker({
  value,
  onChange,
  errorText,
  initialRegion = {
    latitude: -6.2,
    longitude: 106.816666,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showMyLocationButton = true,
  height = 300,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [marker, setMarker] = useState<LatLng | null>(
    value ? { latitude: value.latitude, longitude: value.longitude } : null
  );

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (coords: LatLng): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Alamat tidak ditemukan';
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return 'Alamat tidak dapat dimuat';
    }
  };

  // Handle map tap/long press
  const handleMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarker(coordinate);
    
    setLoading(true);
    const address = await reverseGeocode(coordinate);
    setLoading(false);
    
    onChange({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address,
    });
  };

  // Handle marker drag
  const handleMarkerDrag = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarker(coordinate);
    
    setLoading(true);
    const address = await reverseGeocode(coordinate);
    setLoading(false);
    
    onChange({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address,
    });
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Lokasi Dibutuhkan',
          'Aplikasi membutuhkan izin untuk mengakses lokasi Anda'
        );
        setLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Update map region
      const newRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarker(coords);
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Get address
      const address = await reverseGeocode(coords);
      
      onChange({
        ...coords,
        address,
      });
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error getting current location:', error);
      Alert.alert(
        'Error',
        'Tidak dapat mendapatkan lokasi saat ini. Pastikan GPS aktif.'
      );
    }
  };

  // Handle place selection from search
  const handlePlaceSelect = (data: any, details: any) => {
    if (details?.geometry?.location) {
      const coords = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      const newRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarker(coords);
      mapRef.current?.animateToRegion(newRegion, 1000);

      onChange({
        ...coords,
        address: details.formatted_address || data.description,
      });
    }
  };

  // Update marker position when value prop changes
  useEffect(() => {
    if (value && (value.latitude !== marker?.latitude || value.longitude !== marker?.longitude)) {
      setMarker({ latitude: value.latitude, longitude: value.longitude });
      
      const newRegion = {
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };
      setRegion(newRegion);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <GooglePlacesAutocomplete
        placeholder="Cari lokasi..."
        onPress={handlePlaceSelect}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'id',
          components: 'country:id', // Restrict to Indonesia
          sessiontoken: Math.random().toString(), // Use session token for cost optimization
        }}
        fetchDetails={true}
        styles={searchStyles}
        textInputProps={{
          returnKeyType: 'search',
          blurOnSubmit: true,
        }}
        enablePoweredByContainer={false}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
      />

      {/* Map Container */}
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
          onLongPress={handleMapPress}
          provider="google"
          showsUserLocation={true}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {marker && (
            <Marker
              coordinate={marker}
              draggable={true}
              onDragEnd={handleMarkerDrag}
              title="Lokasi Dipilih"
              description={value?.address || 'Tekan dan tahan untuk memindahkan'}
            />
          )}
        </MapView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1a365d" />
            <Text style={styles.loadingText}>Memuat lokasi...</Text>
          </View>
        )}

        {/* My Location Button */}
        {showMyLocationButton && (
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.myLocationIcon}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Text */}
      {errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      {/* Selected Location Info */}
      {value && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Lokasi Dipilih:</Text>
          <Text style={styles.coordinatesText}>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </Text>
          {value.address && (
            <Text style={styles.addressText}>{value.address}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    position: 'relative',
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1a365d',
    fontWeight: '500',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 5,
  },
  myLocationIcon: {
    fontSize: 24,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  locationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  addressText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
});

const searchStyles = {
  container: {
    flex: 0,
    position: 'relative',
    width: '100%',
    zIndex: 10,
  },
  textInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#101828',
    marginLeft: 0,
    marginRight: 0,
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  row: {
    backgroundColor: '#fff',
    padding: 13,
    minHeight: 44,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#e5e7eb',
  },
  description: {
    fontSize: 14,
    color: '#101828',
  },
  predefinedPlacesDescription: {
    color: '#1f2937',
  },
};
