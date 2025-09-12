import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapLocationPicker, {
  LocationValue,
} from "../components/MapLocationPicker";

interface AddressSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export default function LocationFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse existing location data if passed from createTask
  const [location, setLocation] = useState<LocationValue | undefined>(() => {
    if (params.latitude && params.longitude) {
      return {
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
        address: (params.address as string) || "",
      };
    }
    return undefined;
  });

  const [addressInput, setAddressInput] = useState(
    (params.address as string) || ""
  );
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Auto-search current location on mount if no location provided
  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied"
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const newLocation: LocationValue = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: "",
      };

      setLocation(newLocation);

      // Get address for current location
      reverseGeocode(newLocation.latitude, newLocation.longitude);
    } catch (error) {
      console.error("Error getting current location:", error);
      // Set default Jakarta location if can't get current location
      setLocation({
        latitude: -6.2088,
        longitude: 106.8456,
        address: "",
      });
    }
  }, []);

  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    }
  }, [location, getCurrentLocation]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        const address = data.display_name;
        setAddressInput(address);
        setLocation((prev) => (prev ? { ...prev, address } : undefined));
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);

    try {
      // Using Nominatim (OpenStreetMap) API for address autocomplete
      // Focus search on Indonesia
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=id&limit=10&addressdetails=1`
      );

      const data: AddressSuggestion[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching addresses:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddressInputChange = (text: string) => {
    setAddressInput(text);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchAddresses(text);
    }, 500);

    setSearchTimeout(timeout as any);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const newLocation: LocationValue = {
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      address: suggestion.display_name,
    };

    setLocation(newLocation);
    setAddressInput(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleMapLocationChange = (newLocation: LocationValue | undefined) => {
    setLocation(newLocation);
    if (newLocation) {
      // Update address input and get address for the new location
      reverseGeocode(newLocation.latitude, newLocation.longitude);
    }
  };

  const handleSaveLocation = () => {
    if (!location) {
      Alert.alert("Error", "Pilih lokasi terlebih dahulu");
      return;
    }

    const updatedLocation = {
      ...location,
      address: addressInput.trim() || location.address,
    };

    console.log("LocationForm - Saving location:", {
      originalLocationAddress: location.address,
      addressInput: addressInput,
      finalAddress: updatedLocation.address,
    });

    // Navigate back with location data as parameters
    router.push({
      pathname: "/createTask",
      params: {
        selectedLatitude: updatedLocation.latitude.toString(),
        selectedLongitude: updatedLocation.longitude.toString(),
        selectedAddress: updatedLocation.address,
      },
    });
  };

  const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Pilih Lokasi</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Address Search Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cari Alamat</Text>
              <TextInput
                style={styles.searchInput}
                value={addressInput}
                onChangeText={handleAddressInputChange}
                placeholder="Ketik nama tempat atau alamat (misal: Bandung, Jakarta)"
                multiline
                textAlignVertical="top"
              />

              {loadingSuggestions && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1a365d" />
                  <Text style={styles.loadingText}>Mencari alamat...</Text>
                </View>
              )}
            </View>

            {/* Address Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.place_id}
                  renderItem={renderSuggestion}
                  style={styles.suggestionsList}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                />
              </View>
            )}

            {/* Map Location Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pilih di Peta</Text>
              <Text style={styles.helperText}>
                Ketuk peta untuk memilih lokasi atau gunakan tombol lokasi saat
                ini
              </Text>
              <MapLocationPicker
                value={location}
                onChange={handleMapLocationChange}
                height={300}
                showMyLocationButton={true}
                initialRegion={{
                  latitude: location?.latitude || -6.2088,
                  longitude: location?.longitude || 106.8456,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              />
            </View>

            {/* Location Info Display */}
            {location && (
              <View style={styles.locationInfoContainer}>
                <Text style={styles.locationInfoTitle}>
                  Koordinat Terpilih:
                </Text>
                <Text style={styles.coordinateText}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
                {addressInput && (
                  <Text style={styles.addressText}>Alamat: {addressInput}</Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.getCurrentLocationButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.getCurrentLocationButtonText}>
                  📍 Gunakan Lokasi Saat Ini
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, !location && styles.disabledButton]}
                onPress={handleSaveLocation}
                disabled={!location}
              >
                <Text style={styles.saveButtonText}>Simpan Lokasi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  topbar: {
    backgroundColor: "#1a365d",
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  topbarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 16,
    padding: 20,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#101828",
    marginBottom: 8,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  searchInput: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 50,
    maxHeight: 100,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    marginBottom: 15,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  suggestionText: {
    fontSize: 14,
    color: "#101828",
    lineHeight: 20,
  },
  locationInfoContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  locationInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  coordinateText: {
    fontSize: 13,
    color: "#1e40af",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  addressText: {
    fontSize: 13,
    color: "#1e40af",
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  getCurrentLocationButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  getCurrentLocationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#ffc928",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  saveButtonText: {
    color: "#1a365d",
    fontWeight: "bold",
    fontSize: 16,
  },
});
