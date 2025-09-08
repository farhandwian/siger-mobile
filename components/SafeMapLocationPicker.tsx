/**
 * SafeMapLocationPicker Component
 * A simplified version without GooglePlacesAutocomplete to avoid the filter error
 */

import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

export interface SafeMapLocationPickerProps {
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

export const SafeMapLocationPicker: React.FC<SafeMapLocationPickerProps> = ({
  value,
  onChange,
  errorText,
  initialRegion = DEFAULT_REGION,
  showMyLocationButton = true,
  height = 300,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        // Location permissions granted
      }
    } catch (error) {
      console.warn("Error getting location permissions:", error);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const addressResults = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      if (addressResults.length > 0) {
        const result = addressResults[0];
        const addressParts = [
          result.street,
          result.streetNumber,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);

        if (addressParts.length > 0) {
          address = addressParts.join(", ");
        }
      }

      onChange({
        latitude,
        longitude,
        address,
      });
    } catch {
      onChange({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  };

  const handleMyLocationPress = async () => {
    setIsLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant location permission to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      try {
        const addressResults = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (addressResults.length > 0) {
          const result = addressResults[0];
          const addressParts = [
            result.street,
            result.streetNumber,
            result.city,
            result.region,
            result.country,
          ].filter(Boolean);

          if (addressParts.length > 0) {
            address = addressParts.join(", ");
          }
        }

        onChange({
          latitude,
          longitude,
          address,
        });
      } catch {
        onChange({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      }

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
        "Unable to get your current location. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      Alert.alert(
        "Search",
        `Searching for: ${searchText}\n\nNote: Search functionality will be added in the next update. For now, you can:\n\n• Tap on the map to select a location\n• Use the "My Location" button`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Simple Search Box */}
      <View style={styles.searchContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Cari tempat... (coming soon)"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            placeholderTextColor="#9ca3af"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { height: height || 300 }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={undefined}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          onLongPress={handleMapPress}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          mapType="standard"
          loadingEnabled={true}
          loadingIndicatorColor="#1d4ed8"
          loadingBackgroundColor="#f9fafb"
          onMapReady={() => {
            console.log("Map is ready!");
          }}
        >
          {value && (
            <Marker
              coordinate={{
                latitude: value.latitude,
                longitude: value.longitude,
              }}
              title="Selected Location"
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

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          • Tap anywhere on the map to select a location{"\n"}• Press 🎯 to use
          your current location
        </Text>
      </View>

      {/* Error Text */}
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}

      {/* Coordinates Display */}
      {value && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>Selected Coordinates:</Text>
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
  textInputContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textInput: {
    backgroundColor: "white",
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 0,
  },
  mapContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 60,
    backgroundColor: "#f0f0f0", // Add background color to see if container is visible
  },
  map: {
    flex: 1,
    minHeight: 200, // Ensure minimum height
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
  instructionsContainer: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1d4ed8",
  },
  instructionsText: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 18,
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

export default SafeMapLocationPicker;
