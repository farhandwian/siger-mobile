import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export interface TestMapLocationPickerProps {
  value?: { latitude: number; longitude: number; address?: string };
  onChange: (val: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  height?: number;
}

const TestMapLocationPicker: React.FC<TestMapLocationPickerProps> = ({
  value,
  onChange,
  height = 300,
}) => {
  const [mapReady, setMapReady] = useState(false);

  const defaultRegion = {
    latitude: -6.2, // Jakarta
    longitude: 106.816666,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onChange({
      latitude,
      longitude,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    });
  };

  const handleTestPress = () => {
    console.log(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
    // Test function to set a location manually
    onChange({
      latitude: -6.2,
      longitude: 106.816666,
      address: "Test Location: Jakarta",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Map Location Picker</Text>

      {/* Test Button */}
      <TouchableOpacity style={styles.testButton} onPress={handleTestPress}>
        <Text style={styles.testButtonText}>Set Test Location (Jakarta)</Text>
      </TouchableOpacity>

      {/* Map Container */}
      <View style={[styles.mapContainer, { height }]}>
        {Platform.OS === "web" ? (
          // Web fallback
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>
              Web Map View{"\n"}
              (Tap test button above to set location)
            </Text>
          </View>
        ) : (
          // Native Map
          <MapView
            style={styles.map}
            initialRegion={defaultRegion}
            onPress={handleMapPress}
            onMapReady={() => {
              console.log("Test Map Ready!");
              setMapReady(true);
            }}
            mapType="standard"
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {value && (
              <Marker
                coordinate={{
                  latitude: value.latitude,
                  longitude: value.longitude,
                }}
                title="Selected Location"
                description={value.address || "Test Location"}
                pinColor="#FF6B6B"
              />
            )}
          </MapView>
        )}

        {/* Map Status Indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Map Status: {mapReady ? "✅ Ready" : "⏳ Loading..."}
          </Text>
          <Text style={styles.statusText}>Platform: {Platform.OS}</Text>
        </View>
      </View>

      {/* Selected Location Display */}
      {value && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Selected Location:</Text>
          <Text style={styles.locationText}>
            Latitude: {value.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {value.longitude.toFixed(6)}
          </Text>
          {value.address && (
            <Text style={styles.locationText}>Address: {value.address}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  testButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ddd",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
  },
  webFallbackText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  statusContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2,
  },
  locationInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});

export default TestMapLocationPicker;
