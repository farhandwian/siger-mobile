import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationValue extends LatLng {
  address?: string;
}

export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BasicMapLocationPickerProps {
  value?: LocationValue;
  onChange: (val: LocationValue) => void;
  errorText?: string;
  initialRegion?: MapRegion;
  showMyLocationButton?: boolean;
  height?: number;
}

const DEFAULT_REGION: MapRegion = {
  latitude: -6.2, // Jakarta
  longitude: 106.816666,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const BasicMapLocationPicker: React.FC<BasicMapLocationPickerProps> = ({
  value,
  onChange,
  errorText,
  initialRegion = DEFAULT_REGION,
  showMyLocationButton = true,
  height = 300,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    onChange({
      latitude,
      longitude,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    });
  };

  const handleMyLocationPress = async () => {
    setIsLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Izin Lokasi Diperlukan",
          "Mohon berikan izin lokasi untuk menggunakan fitur ini.",
          [{ text: "OK" }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      onChange({
        latitude,
        longitude,
        address: `Lokasi Saya: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });

      // Animate to current location
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } catch {
      Alert.alert(
        "Error",
        "Tidak dapat mengambil lokasi saat ini. Silakan coba lagi.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Simple Search Placeholder */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchPlaceholder}>
            🔍 Tap pada peta untuk memilih lokasi
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          onLongPress={handleMapPress}
          mapType="standard"
          onMapReady={() => {
            console.log("Basic Map is ready!");
          }}
        >
          {value && (
            <Marker
              coordinate={{
                latitude: value.latitude,
                longitude: value.longitude,
              }}
              title="Lokasi Dipilih"
              description={value.address}
              pinColor="#FF6B6B"
            />
          )}
        </MapView>

        {/* My Location Button */}
        {showMyLocationButton && (
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={handleMyLocationPress}
            disabled={isLoadingLocation}
          >
            <Text style={styles.myLocationButtonText}>
              {isLoadingLocation ? "📍" : "🎯"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Text */}
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}

      {/* Coordinates Display */}
      {value && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>Koordinat Terpilih:</Text>
          <Text style={styles.coordinatesText}>
            Lat: {value.latitude.toFixed(6)}, Lng: {value.longitude.toFixed(6)}
          </Text>
          {value.address && (
            <Text style={styles.addressText}>{value.address}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  searchBox: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  mapContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 60, // Space for search box
    backgroundColor: "#e0e0e0", // Clear fallback background
  },
  map: {
    flex: 1,
    minHeight: 200,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  myLocationButtonText: {
    fontSize: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 4,
  },
  coordinatesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    lineHeight: 16,
  },
});

export default BasicMapLocationPicker;
