import { Link } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiKeyTest from "../components/ApiKeyTest";
import SimpleMapTest from "../components/SimpleMapTest";

export default function MapTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>Map Debugging</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. API Key Test</Text>
        <Text style={styles.sectionDescription}>
          This will test if your Google Maps API key is working correctly
        </Text>
        <View style={styles.testContainer}>
          <ApiKeyTest />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Simple Map Test</Text>
        <Text style={styles.sectionDescription}>
          This will test basic map rendering
        </Text>
        <View style={styles.mapContainer}>
          <SimpleMapTest />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    margin: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  testContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    minHeight: 200,
  },
  mapContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    height: 300,
  },
});
