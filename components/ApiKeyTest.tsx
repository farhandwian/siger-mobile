import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ApiKeyTest() {
  const [apiStatus, setApiStatus] = useState<string>("Testing...");
  const [loading, setLoading] = useState(true);

  const GOOGLE_MAPS_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyDJ_su_d2pygaLLlbGmuP7A3ckGwSq-yF8";

  useEffect(() => {
    const testApiKey = async () => {
      try {
        console.log("Testing API Key:", GOOGLE_MAPS_API_KEY);

        // Test Geocoding API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=Jakarta&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (data.status === "OK") {
          setApiStatus("✅ API Key is working correctly!");
        } else if (data.status === "REQUEST_DENIED") {
          setApiStatus("❌ API Key is invalid or restricted");
        } else if (data.status === "OVER_QUERY_LIMIT") {
          setApiStatus("⚠️ API quota exceeded");
        } else {
          setApiStatus(
            `❌ API Error: ${data.status} - ${
              data.error_message || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error("API Test Error:", error);
        setApiStatus("❌ Network error or API unreachable");
      } finally {
        setLoading(false);
      }
    };

    testApiKey();
  }, [GOOGLE_MAPS_API_KEY]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Maps API Key Test</Text>

      <View style={styles.section}>
        <Text style={styles.label}>API Key:</Text>
        <Text style={styles.apiKey}>{GOOGLE_MAPS_API_KEY}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Text style={styles.status}>{apiStatus}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.instructions}>
          If the API key test fails, check:
          {"\n"}• Google Cloud Console billing is enabled
          {"\n"}• Maps SDK for Android is enabled
          {"\n"}• Maps SDK for iOS is enabled
          {"\n"}• Geocoding API is enabled
          {"\n"}• API key restrictions (if any)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  apiKey: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 4,
    color: "#666",
  },
  status: {
    fontSize: 16,
    color: "#333",
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
