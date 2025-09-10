import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

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

export default function MapLocationPickerTest({
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
  height = 200,
}: Props) {
  const [region, setRegion] = useState<Region>(
    value
      ? {
          latitude: value.latitude,
          longitude: value.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : initialRegion
  );
  const [marker, setMarker] = useState<LatLng | null>(
    value ? { latitude: value.latitude, longitude: value.longitude } : null
  );
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Update region when value changes
  useEffect(() => {
    if (value) {
      const newRegion = {
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setMarker({ latitude: value.latitude, longitude: value.longitude });
    }
  }, [value]);

  // Handle map press
  const handleMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarker(coordinate);

    onChange({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: `${coordinate.latitude.toFixed(
        6
      )}, ${coordinate.longitude.toFixed(6)}`,
    });
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Lokasi Dibutuhkan",
          "Aplikasi membutuhkan izin untuk mengakses lokasi Anda"
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

      // Move map to current location
      mapRef.current?.animateToRegion(newRegion, 1000);

      onChange({
        ...coords,
        address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
          6
        )}`,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Gagal mendapatkan lokasi saat ini");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
          onLongPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {marker && (
            <Marker
              coordinate={marker}
              title="Lokasi Dipilih"
              description={`${marker.latitude.toFixed(
                6
              )}, ${marker.longitude.toFixed(6)}`}
            />
          )}
        </MapView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1a365d" />
            <Text style={styles.loadingText}>Mendapatkan lokasi...</Text>
          </View>
        )}

        {/* My Location Button */}
        {showMyLocationButton && (
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.myLocationButtonText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Location Info */}
      {value && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Lat: {value.latitude.toFixed(6)}, Lng: {value.longitude.toFixed(6)}
          </Text>
          {value.address && (
            <Text style={styles.addressText}>{value.address}</Text>
          )}
        </View>
      )}

      {/* Error Text */}
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    position: "relative",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#1a365d",
    fontWeight: "500",
  },
  myLocationButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
  },
  myLocationButtonText: {
    fontSize: 18,
  },
  locationInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1a365d",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
    fontWeight: "500",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 12,
    marginTop: 5,
    fontWeight: "500",
  },
});
