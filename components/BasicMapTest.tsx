import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BasicMapTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Test - Step by Step</Text>

      <View style={styles.testContainer}>
        <Text style={styles.step}>Step 1: Basic View ✅</Text>
        <View style={styles.basicBox}>
          <Text>
            This is a basic view - if you see this, React Native is working
          </Text>
        </View>
      </View>

      <View style={styles.testContainer}>
        <Text style={styles.step}>Step 2: Test Map Import</Text>
        <Text style={styles.info}>
          Open the demo to see if the basic map component loads without errors
        </Text>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          📝 Note: We'll add the actual map component once we confirm the basic
          structure works
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#1a365d",
  },
  testContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  step: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2d3748",
  },
  basicBox: {
    backgroundColor: "#e6fffa",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38b2ac",
  },
  info: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
  note: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
    marginTop: 20,
  },
  noteText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
  },
});
