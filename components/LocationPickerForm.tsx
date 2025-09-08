import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HybridMapLocationPicker from "./HybridMapLocationPicker";

interface LocationValue {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerFormProps {
  value?: LocationValue;
  onChange: (location: LocationValue) => void;
  errorText?: string;
  placeholder?: string;
}

export const LocationPickerForm: React.FC<LocationPickerFormProps> = ({
  value,
  onChange,
  errorText,
  placeholder = "Cari lokasi...",
}) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationValue | undefined>(
    value
  );

  const handleOpenMap = () => {
    setTempLocation(value);
    setIsMapVisible(true);
  };

  const handleUseLocation = () => {
    if (tempLocation) {
      onChange(tempLocation);
      setIsMapVisible(false);
    } else {
      Alert.alert("Error", "Please select a location first.");
    }
  };

  const handleCancel = () => {
    setTempLocation(value);
    setIsMapVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Location Input */}
      <TouchableOpacity
        style={[styles.input, errorText && styles.inputError]}
        onPress={handleOpenMap}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value
            ? value.address ||
              `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
            : placeholder}
        </Text>
        <Text style={styles.mapIcon}>📍</Text>
      </TouchableOpacity>

      {/* Error Text */}
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}

      {/* Coordinate Display */}
      {value && (
        <View style={styles.coordinateRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>Latitude</Text>
            <TextInput
              style={styles.coordinateField}
              value={value.latitude.toFixed(6)}
              editable={false}
              selectTextOnFocus={true}
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>Longitude</Text>
            <TextInput
              style={styles.coordinateField}
              value={value.longitude.toFixed(6)}
              editable={false}
              selectTextOnFocus={true}
            />
          </View>
        </View>
      )}

      {/* Map Modal */}
      <Modal
        visible={isMapVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pilih Lokasi</Text>
            <TouchableOpacity
              onPress={handleUseLocation}
              style={[
                styles.useButton,
                !tempLocation && styles.useButtonDisabled,
              ]}
              disabled={!tempLocation}
            >
              <Text
                style={[
                  styles.useButtonText,
                  !tempLocation && styles.useButtonTextDisabled,
                ]}
              >
                Gunakan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <HybridMapLocationPicker
              value={tempLocation}
              onChange={setTempLocation}
              height={400}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Cara Memilih Lokasi:</Text>
            <Text style={styles.instructionsText}>
              • Ketik nama tempat pada kotak pencarian{"\n"}• Atau sentuh/tekan
              lama pada peta{"\n"}• Tekan tombol 🎯 untuk menggunakan lokasi
              saat ini
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  inputText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    paddingRight: 8,
  },
  placeholder: {
    color: "#9ca3af",
  },
  mapIcon: {
    fontSize: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  coordinateRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  coordinateField: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#374151",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: "#1a365d",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  useButton: {
    backgroundColor: "#ffc928",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  useButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  useButtonText: {
    color: "#1a365d",
    fontSize: 16,
    fontWeight: "600",
  },
  useButtonTextDisabled: {
    color: "#6b7280",
  },
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  instructionsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a365d",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
});

export default LocationPickerForm;
