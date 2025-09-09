import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import MapLocationPicker, { LocationValue } from "../components/MapLocationPicker";

// Custom Dropdown Component
const CustomDropdown = ({
  items,
  value,
  onSelect,
  placeholder,
  style = {},
  searchable = false,
  disabled = false,
}: {
  items: any[];
  value: any;
  onSelect: (value: any) => void;
  placeholder: string;
  style?: any;
  searchable?: boolean;
  disabled?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredItems = searchable
    ? items.filter((item: any) => {
        const searchLower = searchText.toLowerCase().trim();
        const labelLower = item.label.toLowerCase();
        // Search dalam label dengan multiple kata
        return (
          searchLower === "" ||
          labelLower.includes(searchLower) ||
          labelLower
            .split(" ")
            .some((word: string) => word.startsWith(searchLower))
        );
      })
    : items;

  const selectedItem = items.find((item: any) => item.value === value);

  const handleSelect = (item: any) => {
    onSelect(item.value);
    setIsVisible(false);
    setSearchText(""); // Reset search when closing
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchText(""); // Reset search when closing
  };

  // Function to highlight searched text
  const renderHighlightedText = (
    text: string,
    searchTerm: string,
    itemValue: any
  ) => {
    const isSelected = itemValue === value;

    if (!searchable || !searchTerm.trim()) {
      return (
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
          numberOfLines={0}
        >
          {text}
        </Text>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <Text
        style={[styles.optionText, isSelected && styles.selectedOptionText]}
        numberOfLines={0}
      >
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.customDropdown,
          style,
          disabled && styles.disabledDropdown,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[styles.customDropdownText, disabled && styles.disabledText]}
          numberOfLines={2}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text
          style={[styles.customDropdownArrow, disabled && styles.disabledText]}
        >
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={handleClose}>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>{placeholder}</Text>

            {searchable && (
              <View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ketik untuk mencari..."
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={true}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                />
                {searchText.length > 0 && (
                  <Text style={styles.searchResultText}>
                    Ditemukan {filteredItems.length} hasil
                  </Text>
                )}
              </View>
            )}

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              ListEmptyComponent={
                searchable && searchText.length > 0 ? (
                  <View style={styles.emptySearchContainer}>
                    <Text style={styles.emptySearchText}>
                      Tidak ada hasil untuk &quot;{searchText}&quot;
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  {renderHighlightedText(item.label, searchText, item.value)}
                  {item.value === value && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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

  // API Data states
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedSubActivity, setSelectedSubActivity] = useState("");
  const [progress, setProgress] = useState("1.015");
  const [catatan, setCatatan] = useState(
    "Telah dilaksanakan mobilisasi untuk persiapan awal proyek. Kegiatan meliputi pembersihan lokasi dan pengiriman material tahap pertama."
  );
  const [location, setLocation] = useState<LocationValue | undefined>(undefined);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [tanggalProgres, setTanggalProgres] = useState(getTodayDate());

  // Fetch projects data on component mount
  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // For Expo Go on physical device, we need to use the computer's IP address
      // The Expo server shows the IP as 192.168.11.122, so API server should be accessible there
      const API_BASE_URL = "http://10.44.44.20:3000";

      console.log(`Fetching from: ${API_BASE_URL}/api/full-projects`);
      const response = await fetch(`${API_BASE_URL}/api/full-projects`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setProjectsData(result.data);
        console.log("Successfully loaded data from API");
      } else {
        Alert.alert("Error", "Gagal memuat data proyek");
        // Use fallback mock data
        setProjectsData(getMockData());
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      console.log("Using mock data as fallback");
      // Show a brief notification that we're using mock data
      Alert.alert(
        "Koneksi Gagal",
        "Tidak dapat terhubung ke API server. Pastikan:\n\n1. API server berjalan di http://10.44.44.20:3000\n2. HP dan komputer dalam WiFi yang sama\n\nMenggunakan data demo untuk sementara.",
        [
          { text: "Coba Lagi", onPress: () => fetchProjects() },
          { text: "Lanjut dengan Demo", style: "cancel" },
        ]
      );
      // Use fallback mock data when API fails
      setProjectsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback for development
  const getMockData = () => {
    return [
      {
        id: "cm0txl9yk00015wjn8h2r3k7b",
        pekerjaan: "Pembangunan Irigasi Desa Sukamaju",
        penyediaJasa: "CV Maju Bersama",
        nilaiKontrak: "Rp 5,500,000,000",
        tanggalKontrak: "2025-01-15",
        akhirKontrak: "2025-12-15",
        fisikProgress: 25.5,
        fisikTarget: 100,
        activities: [
          {
            id: "act001",
            name: "Pekerjaan Persiapan",
            order: 1,
            subActivities: [
              {
                id: "sub001",
                name: "Pembersihan Lahan",
                satuan: "m2",
                volumeKontrak: 1500.0,
                weight: 15.0,
                order: 1,
              },
              {
                id: "sub002",
                name: "Pematokan",
                satuan: "m",
                volumeKontrak: 500.0,
                weight: 10.0,
                order: 2,
              },
            ],
          },
          {
            id: "act002",
            name: "Pekerjaan Galian",
            order: 2,
            subActivities: [
              {
                id: "sub003",
                name: "Galian Saluran Primer",
                satuan: "m3",
                volumeKontrak: 2500.0,
                weight: 30.0,
                order: 1,
              },
              {
                id: "sub004",
                name: "Galian Saluran Sekunder",
                satuan: "m3",
                volumeKontrak: 1200.0,
                weight: 20.0,
                order: 2,
              },
            ],
          },
          {
            id: "act003",
            name: "Pekerjaan Struktur",
            order: 3,
            subActivities: [
              {
                id: "sub005",
                name: "Pemasangan Pintu Air",
                satuan: "unit",
                volumeKontrak: 5.0,
                weight: 15.0,
                order: 1,
              },
              {
                id: "sub006",
                name: "Pembetonan Saluran",
                satuan: "m",
                volumeKontrak: 800.0,
                weight: 10.0,
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: "cm0txl9yk00025wjn8h2r3k8c",
        pekerjaan: "Rehabilitasi Jaringan Irigasi Cikampek",
        penyediaJasa: "PT Bangun Karya",
        nilaiKontrak: "Rp 8,200,000,000",
        tanggalKontrak: "2025-02-01",
        akhirKontrak: "2026-01-31",
        fisikProgress: 45.2,
        fisikTarget: 100,
        activities: [
          {
            id: "act004",
            name: "Pekerjaan Pembongkaran",
            order: 1,
            subActivities: [
              {
                id: "sub007",
                name: "Pembongkaran Struktur Lama",
                satuan: "m3",
                volumeKontrak: 800.0,
                weight: 20.0,
                order: 1,
              },
            ],
          },
          {
            id: "act005",
            name: "Pekerjaan Rekonstruksi",
            order: 2,
            subActivities: [
              {
                id: "sub008",
                name: "Pembuatan Pondasi",
                satuan: "m3",
                volumeKontrak: 600.0,
                weight: 25.0,
                order: 1,
              },
              {
                id: "sub009",
                name: "Pemasangan Dinding",
                satuan: "m2",
                volumeKontrak: 1500.0,
                weight: 35.0,
                order: 2,
              },
              {
                id: "sub010",
                name: "Finishing",
                satuan: "m2",
                volumeKontrak: 1500.0,
                weight: 20.0,
                order: 3,
              },
            ],
          },
        ],
      },
    ];
  };

  // Get dropdown options
  const getProjectOptions = () => {
    return projectsData.map((project: any) => ({
      label: project.pekerjaan,
      value: project.id,
    }));
  };

  const getActivityOptions = () => {
    if (!selectedProject) return [];

    const project = projectsData.find((p: any) => p.id === selectedProject);
    if (!project) return [];

    return project.activities.map((activity: any) => ({
      label: activity.name,
      value: activity.id,
    }));
  };

  const getSubActivityOptions = () => {
    if (!selectedProject || !selectedActivity) return [];

    const project = projectsData.find((p: any) => p.id === selectedProject);
    if (!project) return [];

    const activity = project.activities.find(
      (a: any) => a.id === selectedActivity
    );
    if (!activity) return [];

    return activity.subActivities.map((subActivity: any) => ({
      label: subActivity.name,
      value: subActivity.id,
    }));
  };

  // Handle dropdown changes
  const handleProjectChange = (projectId: any) => {
    setSelectedProject(projectId);
    setSelectedActivity(""); // Reset activity
    setSelectedSubActivity(""); // Reset sub-activity
  };

  const handleActivityChange = (activityId: any) => {
    setSelectedActivity(activityId);
    setSelectedSubActivity(""); // Reset sub-activity
  };

  const handleSubActivityChange = (subActivityId: any) => {
    setSelectedSubActivity(subActivityId);
  };

  const handleSubmit = async () => {
    if (!selectedProject) {
      Alert.alert("Error", "Pilih proyek terlebih dahulu");
      return;
    }
    if (!selectedActivity) {
      Alert.alert("Error", "Pilih kegiatan terlebih dahulu");
      return;
    }
    if (!selectedSubActivity) {
      Alert.alert("Error", "Pilih sub kegiatan terlebih dahulu");
      return;
    }

    setSubmitting(true);

    try {
      const API_BASE_URL = "http://192.168.11.122:3000";

      // Prepare payload according to API specification
      const payload = {
        user_id: "cmfb8i5yo0000vpgc5p776720",
        sub_activities_id: selectedSubActivity,
        tanggal_progres: tanggalProgres,
        progres_realisasi_per_hari: parseFloat(progress) || 0,
        koordinat: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : {
          latitude: -6.2088, // Default Jakarta coordinates
          longitude: 106.8456,
        },
        catatan_kegiatan: catatan.trim(),
        files: [
          {
            file: "progress_photo_1.jpg",
            path: "/upload/progress/progress_photo_1.jpg",
          },
          {
            file: "progress_photo_2.jpg",
            path: "/upload/progress/progress_photo_2.jpg",
          },
          {
            file: "progress_photo_3.jpg",
            path: "/upload/progress/progress_photo_3.jpg",
          },
        ],
      };

      console.log("Submitting daily progress:", payload);

      const response = await fetch(
        `${API_BASE_URL}/api/daily-sub-activities-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log("Daily progress updated successfully:", result);
        Alert.alert("Berhasil", "Laporan harian berhasil dikirim!", [
          { text: "OK", onPress: () => router.replace("/createTaskSuccess") },
        ]);
      } else {
        throw new Error(result.message || "Failed to update daily progress");
      }
    } catch (error: any) {
      console.error("Error submitting daily progress:", error);
      Alert.alert(
        "Gagal",
        "Laporan gagal dikirim. Silakan coba lagi.\n\nDetail: " +
          (error.message || error.toString())
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>Buat Laporan Harian</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a365d" />
          <Text style={styles.loadingText}>Memuat data proyek...</Text>
        </View>
      </View>
    );
  }

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
                items={getProjectOptions()}
                value={selectedProject}
                onSelect={handleProjectChange}
                placeholder="Pilih Proyek"
                searchable={true}
              />
            </View>

            {/* Kegiatan Dropdown - Only show if project is selected */}
            {selectedProject && (
              <View style={[styles.formGroup, { zIndex: 1 }]}>
                <Text style={styles.label}>Pilih Kegiatan *</Text>
                <CustomDropdown
                  items={getActivityOptions()}
                  value={selectedActivity}
                  onSelect={handleActivityChange}
                  placeholder="Pilih Kegiatan"
                  searchable={true}
                />
              </View>
            )}

            {/* Sub Kegiatan Dropdown - Only show if activity is selected */}
            {selectedActivity && (
              <View style={[styles.formGroup, { zIndex: 1 }]}>
                <Text style={styles.label}>Pilih Sub Kegiatan *</Text>
                <CustomDropdown
                  items={getSubActivityOptions()}
                  value={selectedSubActivity}
                  onSelect={handleSubActivityChange}
                  placeholder="Pilih Sub Kegiatan"
                  searchable={true}
                />
              </View>
            )}

            {/* Tanggal Progres */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tanggal Progres *</Text>
              <TextInput
                style={styles.input}
                value={tanggalProgres}
                onChangeText={setTanggalProgres}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Progress */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Progress (%) *</Text>
              <TextInput
                style={styles.input}
                value={progress}
                onChangeText={setProgress}
                keyboardType="numeric"
                placeholder="Masukkan progress dalam persen (0-100)"
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
            {/* Koordinat Lokasi dengan Peta */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Koordinat Lokasi</Text>
              <MapLocationPicker
                value={location}
                onChange={setLocation}
                height={250}
                showMyLocationButton={true}
              />
            </View>

            {/* Latitude & Longitude Display */}
            {location && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={location.latitude.toFixed(6)}
                    editable={false}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={location.longitude.toFixed(6)}
                    editable={false}
                  />
                </View>
                {location.address && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Alamat</Text>
                    <TextInput
                      style={styles.input}
                      value={location.address}
                      onChangeText={(text) => setLocation({ ...location, address: text })}
                      multiline
                      placeholder="Alamat dapat diedit manual jika diperlukan"
                    />
                  </View>
                )}
              </>
            )}
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Mengirim..." : "Kirim Laporan"}
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
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  topbarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 16,
    padding: 20,
    elevation: 3,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
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
  disabledDropdown: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  customDropdownText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    paddingRight: 8,
  },
  disabledText: {
    color: "#9ca3af",
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
  searchResultText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySearchContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptySearchText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  highlightedText: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontWeight: "bold",
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
    color: "#101828", // Dark gray untuk text normal
    flex: 1,
    lineHeight: 20,
  },
  selectedOptionText: {
    color: "#1d4ed8", // Blue hanya untuk item yang dipilih
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
  disabledInput: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    color: "#6b7280",
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
    boxShadow: "0px 2px 4px rgba(255, 201, 40, 0.15)",
  },
  buttonText: {
    color: "#1a365d",
    fontWeight: "bold",
    fontSize: 16,
  },
});
