import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function SimpleMapTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Map Test</Text>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -6.2,
          longitude: 106.816666,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onMapReady={() => {
          console.log("Map loaded successfully!");
          Alert.alert("Success", "Map loaded successfully!");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    margin: 20,
  },
  map: {
    flex: 1,
  },
});
