import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";

const { width, height } = Dimensions.get("window");

const DebugMapComponent = () => {
  const defaultRegion = {
    latitude: -6.2, // Jakarta
    longitude: 106.816666,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Map Test</Text>
      <Text style={styles.subtitle}>Map should appear below:</Text>

      {/* Simple Map Test */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={defaultRegion}
          onMapReady={() => {
            console.log("DEBUG: Map is ready!");
          }}
          onMapLoaded={() => {
            console.log("DEBUG: Map loaded!");
          }}
        />
      </View>

      <Text style={styles.info}>
        If you see this text but no map above, there&apos;s a map rendering
        issue.
      </Text>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Screen Width: {width}</Text>
        <Text style={styles.debugText}>Screen Height: {height}</Text>
        <Text style={styles.debugText}>Map Container: 300x300</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  mapWrapper: {
    width: 300,
    height: 300,
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  info: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#888",
    fontStyle: "italic",
  },
  debugInfo: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
});

export default DebugMapComponent;
