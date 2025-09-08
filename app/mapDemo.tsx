import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LocationPickerForm } from "../components/LocationPickerForm";
import { LocationValue } from "../components/MapLocationPicker";

export default function MapDemoScreen() {
  const [location, setLocation] = useState<LocationValue | undefined>();

  const handleLocationChange = (newLocation: LocationValue) => {
    setLocation(newLocation);
    console.log("Selected location:", newLocation);
  };

  const clearLocation = () => {
    setLocation(undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Location Picker Demo</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Select Location:</Text>
        <LocationPickerForm
          value={location}
          onChange={handleLocationChange}
          placeholder="Tap to select location..."
        />
      </View>

      {location && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Selected Location:</Text>
          <Text style={styles.resultText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.resultText}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
          {location.address && (
            <Text style={styles.resultText}>Address: {location.address}</Text>
          )}

          <TouchableOpacity style={styles.clearButton} onPress={clearLocation}>
            <Text style={styles.clearButtonText}>Clear Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a365d",
    textAlign: "center",
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#1a365d",
    fontWeight: "600",
    marginBottom: 12,
  },
  resultContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 6,
    fontFamily: "monospace",
  },
  clearButton: {
    backgroundColor: "#e53e3e",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
