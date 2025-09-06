import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const pekerjaanDummy = [
  {
    label:
      "REHABILITASI/ PENINGKATAN BANGUNAN, PINTU AIR DAN JARINGAN IRIGASI DI/DIR di KABUPATEN LAMPUNG TENGAH DAN KABUPATEN LAMPUNG TIMUR",
    value: "rehab",
  },
  { label: "PEMBANGUNAN JEMBATAN BARU", value: "jembatan" },
  { label: "PERBAIKAN SALURAN IRIGASI", value: "irigasi" },
];
const kegiatanDummy = [
  {
    label: "Galian Tanah di Rawa menggunakan Excavator Standar",
    value: "galian",
  },
  { label: "Pemasangan Pintu Air", value: "pintuair" },
  { label: "Pengecoran Saluran", value: "pengecoran" },
];
const proyekDummy = [
  { label: "Proyek A", value: "proyekA" },
  { label: "Proyek B", value: "proyekB" },
  { label: "Proyek C", value: "proyekC" },
];

// Custom Dropdown Component
const CustomDropdown = ({
  items,
  value,
  onSelect,
  placeholder,
  style = {},
  searchable = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredItems = searchable
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : items;

  const selectedItem = items.find((item) => item.value === value);

  const handleSelect = (item) => {
    onSelect(item.value);
    setIsVisible(false);
    setSearchText("");
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.customDropdown, style]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.customDropdownText} numberOfLines={2}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text style={styles.customDropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>{placeholder}</Text>

            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder="Cari..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
            )}

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.selectedOptionText,
                    ]}
                    numberOfLines={0}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function CreateTaskScreen() {
  const router = useRouter();
  // Dropdown states
  const [pekerjaan, setPekerjaan] = useState(pekerjaanDummy[0].value);
  const [kegiatan, setKegiatan] = useState(kegiatanDummy[0].value);
  const [proyek, setProyek] = useState(proyekDummy[0].value);
  const [progress, setProgress] = useState("1.015");
  const [catatan, setCatatan] = useState(
    "Telah dilaksanakan mobilisasi untuk persiapan awal proyek. Kegiatan meliputi pembersihan lokasi dan pengiriman material tahap pertama."
  );
  const [koordinat, setKoordinat] = useState("");
  const [uploadImages, setUploadImages] = useState([]); // dummy, not implemented
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        router.replace("/createTaskSuccess");
      } else {
        Alert.alert("Gagal", "Laporan gagal dikirim. Silakan coba lagi.");
      }
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Buat Laporan Harian</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.card}>
            {/* Proyek Dropdown */}
            <View style={[styles.formGroup, { zIndex: 1 }]}>
              <Text style={styles.label}>Pilih Proyek *</Text>
              <CustomDropdown
                items={proyekDummy}
                value={proyek}
                onSelect={setProyek}
                placeholder="Pilih Proyek"
                searchable={true}
              />
            </View>
            {/* Pekerjaan Dropdown */}
            <View style={[styles.formGroup, { zIndex: 1 }]}>
              <Text style={styles.label}>Pilih Pekerjaan *</Text>
              <CustomDropdown
                items={pekerjaanDummy}
                value={pekerjaan}
                onSelect={setPekerjaan}
                placeholder="Pilih Pekerjaan"
                searchable={true}
              />
            </View>
            {/* Kegiatan Dropdown */}
            <View style={[styles.formGroup, { zIndex: 1 }]}>
              <Text style={styles.label}>Pilih Kegiatan *</Text>
              <CustomDropdown
                items={kegiatanDummy}
                value={kegiatan}
                onSelect={setKegiatan}
                placeholder="Pilih Kegiatan"
                searchable={true}
              />
            </View>
            {/* Progress */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Progress *</Text>
              <TextInput
                style={styles.input}
                value={progress}
                onChangeText={setProgress}
                keyboardType="numeric"
              />
            </View>
            {/* Catatan */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Catatan Kegiatan</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={catatan}
                onChangeText={setCatatan}
                multiline
              />
            </View>
            {/* Koordinat */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Koordinat Lokasi</Text>
              <TextInput
                style={styles.input}
                value={koordinat}
                onChangeText={setKoordinat}
                placeholder="Cari lokasi..."
              />
            </View>
            {/* Gambar */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gambar Kegiatan (Max 5MB)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Dummy images, not implemented */}
                <Image
                  source={{
                    uri: "http://localhost:3845/assets/c57d67378967725d8500d8cd523b2f0609b154c6.png",
                  }}
                  style={styles.image}
                />
                <Image
                  source={{
                    uri: "http://localhost:3845/assets/e4d02ee6b1dc9201958b964e051d9d005551646e.png",
                  }}
                  style={styles.image}
                />
                <Image
                  source={{
                    uri: "http://localhost:3845/assets/92058e5232f967d7349f4c6e700e0499f4f2da49.png",
                  }}
                  style={styles.image}
                />
              </View>
            </View>
            {/* Example extra fields for scroll test (remove if not needed) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>tes</Text>
              <TextInput
                style={styles.input}
                value={koordinat}
                onChangeText={setKoordinat}
                placeholder="Cari lokasi..."
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>tes</Text>
              <TextInput
                style={styles.input}
                value={koordinat}
                onChangeText={setKoordinat}
                placeholder="Cari lokasi..."
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>tes</Text>
              <TextInput
                style={styles.input}
                value={koordinat}
                onChangeText={setKoordinat}
                placeholder="Cari lokasi..."
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </Text>
            </TouchableOpacity>
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
    padding: 0,
  },
  topbar: {
    backgroundColor: "#1a365d",
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  formGroup: {
    marginBottom: 18,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    color: "#101828",
    marginBottom: 4,
    fontWeight: "600",
  },
  // Custom Dropdown Styles
  customDropdown: {
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
  customDropdownText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    paddingRight: 8,
  },
  customDropdownArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#101828",
    marginBottom: 15,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#f0f9ff",
  },
  optionText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    lineHeight: 20,
  },
  selectedOptionText: {
    color: "#1d4ed8",
    fontWeight: "500",
  },
  checkMark: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#1a365d",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  button: {
    backgroundColor: "#ffc928",
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#ffc928",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#1a365d",
    fontWeight: "bold",
    fontSize: 16,
  },
});
