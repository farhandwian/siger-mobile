import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiKeyTest from "../components/ApiKeyTest";
import SimpleMapTest from "../components/SimpleMapTest";

export default function MapDemoScreen() {
  const [activeTest, setActiveTest] = useState<"api" | "map">("api");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map Testing Screen</Text>
        <Text style={styles.headerSubtitle}>
          Step-by-step debugging approach
        </Text>
      </View>

      {/* Test Selection */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTest === "api" && styles.activeTab]}
          onPress={() => setActiveTest("api")}
        >
          <Text
            style={[
              styles.tabText,
              activeTest === "api" && styles.activeTabText,
            ]}
          >
            1. API Key Test
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTest === "map" && styles.activeTab]}
          onPress={() => setActiveTest("map")}
        >
          <Text
            style={[
              styles.tabText,
              activeTest === "map" && styles.activeTabText,
            ]}
          >
            2. Map Test
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Content */}
      <View style={styles.testContainer}>
        {activeTest === "api" ? (
          <ScrollView style={styles.scrollContainer}>
            <ApiKeyTest />
          </ScrollView>
        ) : (
          <SimpleMapTest />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#1a365d",
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1a365d",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#fff",
  },
  testContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
});
