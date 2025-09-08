import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import DebugMapComponent from "../components/DebugMapComponent";

export default function DebugMapScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Debug Screen</Text>
        <Text style={styles.subtitle}>Testing Map Rendering</Text>
      </View>

      <DebugMapComponent />

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Check if map appears above{"\n"}
          2. Look for console logs in Metro bundler{"\n"}
          3. If map doesn&apos;t show, there&apos;s a configuration issue
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#1a365d",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
  },
  instructions: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    margin: 20,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
