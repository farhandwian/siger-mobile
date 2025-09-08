/**
 * MapLocationPicker Component
 *
 * Installation:
 * expo install react-native-maps expo-location
 * npm i react-native-google-places-autocomplete
 *
 * Required app.json configuration:
 * {
 *   "expo": {
 *     "android": {
 *       "config": {
 *         "googleMaps": {
 *           "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
 *         }
 *       }
 *     },
 *     "ios": {
 *       "config": {
 *         "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
 *       }
 *     }
 *   }
 * }
 *
 * Environment variable: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
 */

import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

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

export interface MapLocationPickerProps {
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

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  value,
  onChange,
  errorText,
  initialRegion = DEFAULT_REGION,
  showMyLocationButton = true,
  height = 300,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log(GOOGLE_MAPS_API_KEY);
  useEffect(() => {
    // Request location permissions on mount
    requestLocationPermissions();
  }, []);

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch {
      console.warn("Error getting location permissions");
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      // Try to get address from coordinates using reverse geocoding
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
      // Fallback to coordinates string if reverse geocoding fails
      onChange({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  };

  const handlePlaceSelect = (data: any, details: any) => {
    if (details?.geometry?.location) {
      const { lat, lng } = details.geometry.location;
      const newLocation: LocationValue = {
        latitude: lat,
        longitude: lng,
        address:
          data.description ||
          details.formatted_address ||
          data.structured_formatting?.main_text,
      };

      onChange(newLocation);

      // Animate to the selected location
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
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

      // Get address for current location
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

      setUserLocation({ latitude, longitude });
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

  const mapRegion: MapRegion = value
    ? {
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: initialRegion.latitudeDelta,
        longitudeDelta: initialRegion.longitudeDelta,
      }
    : initialRegion;

  return (
    <View style={styles.container}>
      {/* Search Box */}
      <View style={styles.searchContainer}>
        {GOOGLE_MAPS_API_KEY ? (
          <GooglePlacesAutocomplete
            placeholder="Cari tempat..."
            onPress={handlePlaceSelect}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "id",
              components: "country:id",
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            debounce={300}
            minLength={2}
            listEmptyComponent={() => (
              <View style={styles.emptyComponent}>
                <Text style={styles.emptyText}>
                  Ketik untuk mencari lokasi...
                </Text>
              </View>
            )}
            styles={{
              container: styles.autocompleteContainer,
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: styles.listView,
              row: styles.suggestionRow,
              description: styles.suggestionText,
            }}
            renderRow={(data) => (
              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {data?.description || "Unknown location"}
                </Text>
              </View>
            )}
            onFail={(error) => {
              console.warn("Places API Error:", error);
            }}
            textInputProps={{
              placeholderTextColor: "#9ca3af",
              autoCorrect: false,
              autoCapitalize: "none",
            }}
          />
        ) : (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Google API key tidak dikonfigurasi"
              editable={false}
            />
          </View>
        )}
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          region={mapRegion}
          onPress={handleMapPress}
          onLongPress={handleMapPress}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
          loadingEnabled={true}
          loadingIndicatorColor="#1a365d"
          loadingBackgroundColor="#f9fafb"
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
  autocompleteContainer: {
    flex: 0,
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
  listView: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  emptyComponent: {
    padding: 12,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 12,
  },
  mapContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 60, // Space for search box
  },
  map: {
    flex: 1,
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

export default MapLocationPicker;
