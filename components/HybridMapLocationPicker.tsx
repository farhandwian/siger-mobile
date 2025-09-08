import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export interface HybridMapLocationPickerProps {
  value?: { latitude: number; longitude: number; address?: string };
  onChange: (val: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  height?: number;
}

const HybridMapLocationPicker: React.FC<HybridMapLocationPickerProps> = ({
  value,
  onChange,
  height = 300,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

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

  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert(
        "Error",
        "Masukkan koordinat yang valid\nContoh: -6.200000, 106.816666"
      );
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert("Error", "Latitude harus antara -90 sampai 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert("Error", "Longitude harus antara -180 sampai 180");
      return;
    }

    onChange({
      latitude: lat,
      longitude: lng,
      address: `Manual Input: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });

    setShowManualInput(false);
    setManualLat("");
    setManualLng("");
  };

  const quickLocations = [
    { name: "Jakarta", lat: -6.2, lng: 106.816666 },
    { name: "Bandung", lat: -6.914744, lng: 107.60981 },
    { name: "Surabaya", lat: -7.250445, lng: 112.768845 },
    { name: "Yogyakarta", lat: -7.797068, lng: 110.370529 },
  ];

  const handleQuickLocation = (location: any) => {
    onChange({
      latitude: location.lat,
      longitude: location.lng,
      address: `${location.name}: ${location.lat.toFixed(
        6
      )}, ${location.lng.toFixed(6)}`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pilih Lokasi</Text>
        <Text style={styles.subtitle}>
          {mapReady ? "🗺️ Map Ready" : "⏳ Loading Map..."}
        </Text>
      </View>

      {/* Map Container */}
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={defaultRegion}
          onPress={handleMapPress}
          onMapReady={() => {
            console.log("Hybrid Map Ready!");
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
              title="Lokasi Dipilih"
              description={value.address || "Selected Location"}
              pinColor="#FF6B6B"
            />
          )}
        </MapView>

        {/* Overlay jika map tidak ready */}
        {!mapReady && (
          <View style={styles.mapOverlay}>
            <Text style={styles.overlayText}>
              🗺️ Loading Map...{"\n"}
              Gunakan pilihan di bawah jika map tidak muncul
            </Text>
          </View>
        )}
      </View>

      {/* Alternative Input Methods */}
      <View style={styles.alternativeContainer}>
        <Text style={styles.alternativeTitle}>Cara Lain Pilih Lokasi:</Text>

        {/* Quick Locations */}
        <View style={styles.quickLocationsContainer}>
          <Text style={styles.sectionTitle}>📍 Lokasi Cepat:</Text>
          <View style={styles.quickLocationsGrid}>
            {quickLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickLocationButton}
                onPress={() => handleQuickLocation(location)}
              >
                <Text style={styles.quickLocationText}>{location.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Manual Input Toggle */}
        <TouchableOpacity
          style={styles.manualInputToggle}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <Text style={styles.manualInputToggleText}>
            ⌨️ {showManualInput ? "Sembunyikan" : "Input Manual Koordinat"}
          </Text>
        </TouchableOpacity>

        {/* Manual Input Form */}
        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <Text style={styles.sectionTitle}>📐 Input Manual:</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Latitude:</Text>
                <TextInput
                  style={styles.input}
                  value={manualLat}
                  onChangeText={setManualLat}
                  placeholder="-6.200000"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Longitude:</Text>
                <TextInput
                  style={styles.input}
                  value={manualLng}
                  onChangeText={setManualLng}
                  placeholder="106.816666"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleManualInput}
            >
              <Text style={styles.submitButtonText}>
                ✅ Gunakan Koordinat Ini
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Selected Location Display */}
      {value && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationTitle}>📌 Lokasi Terpilih:</Text>
          <Text style={styles.selectedLocationText}>
            Lat: {value.latitude.toFixed(6)}
          </Text>
          <Text style={styles.selectedLocationText}>
            Lng: {value.longitude.toFixed(6)}
          </Text>
          {value.address && (
            <Text style={styles.selectedLocationAddress}>{value.address}</Text>
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
  header: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#ddd",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(240, 240, 240, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  alternativeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  quickLocationsContainer: {
    marginBottom: 16,
  },
  quickLocationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickLocationButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  quickLocationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  manualInputToggle: {
    backgroundColor: "#6B7280",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  manualInputToggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  manualInputContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedLocationContainer: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  selectedLocationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "monospace",
  },
  selectedLocationAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default HybridMapLocationPicker;
