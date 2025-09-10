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
// Import packages untuk image picker dan file system
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

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

// Interface untuk data gambar yang akan diupload
interface ImageData {
  id: string;
  uri: string;
  name: string;
  type: string;
  size: number;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  minioPath?: string; // Path file di Minio setelah diupload
  minioFileName?: string; // Nama file di Minio
}

// Komponen untuk upload dan preview gambar
const ImageUploadComponent = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  maxSize?: number;
}) => {
  // Fungsi untuk meminta permission kamera dan galeri
  const requestPermissions = async () => {
    try {
      // Request permission untuk kamera
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      // Request permission untuk media library
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return cameraPermission.granted && mediaPermission.granted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  // Fungsi untuk menampilkan pilihan sumber gambar (kamera atau galeri)
  const showImageSourceOptions = () => {
    const remainingSlots = maxImages - images.length;

    Alert.alert(
      "Pilih Sumber Gambar",
      `Anda bisa menambah ${remainingSlots} gambar lagi\n\n• Kamera: Ambil 1 foto\n• Galeri: Pilih beberapa foto sekaligus`,
      [
        {
          text: "📷 Kamera",
          onPress: () => pickImageFromCamera(),
        },
        {
          text: "🖼️ Galeri (Multiple)",
          onPress: () => pickImageFromGallery(),
        },
        {
          text: "Batal",
          style: "cancel",
        },
      ]
    );
  };

  // Fungsi untuk mengambil gambar dari kamera
  const pickImageFromCamera = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert("Error", "Permission kamera dan galeri diperlukan");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Skip deprecated warning for now
        allowsEditing: false, // Tidak wajib crop, biar gambar full
        quality: 0.8, // Kompresi gambar untuk mengurangi ukuran file
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image from camera:", error);
      Alert.alert("Error", "Gagal mengambil gambar dari kamera");
    }
  };

  // Fungsi untuk mengambil gambar dari galeri (multiple selection)
  const pickImageFromGallery = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert("Error", "Permission galeri diperlukan");
        return;
      }

      // Hitung berapa gambar yang masih bisa dipilih
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        Alert.alert(
          "Error",
          `Maksimal ${maxImages} gambar yang dapat diupload`
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Tidak wajib crop, biar gambar full
        quality: 0.8, // Kompresi gambar untuk mengurangi ukuran file
        allowsMultipleSelection: true, // Enable multiple selection
        selectionLimit: remainingSlots, // Batasi sesuai slot yang tersisa
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process multiple images yang dipilih
        await handleMultipleImagesSelected(result.assets);
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      Alert.alert("Error", "Gagal mengambil gambar dari galeri");
    }
  };

  // Fungsi untuk memproses gambar yang dipilih (single image)
  const handleImageSelected = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      // Cek apakah sudah mencapai batas maksimal gambar
      if (images.length >= maxImages) {
        Alert.alert(
          "Error",
          `Maksimal ${maxImages} gambar yang dapat diupload`
        );
        return;
      }

      // Dapatkan informasi file
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      // Cek ukuran file (fileInfo memiliki property size jika file exists)
      if (fileInfo.exists && "size" in fileInfo && fileInfo.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        Alert.alert(
          "Error",
          `Ukuran gambar tidak boleh lebih dari ${sizeMB}MB`
        );
        return;
      }

      // Generate unique ID untuk gambar
      const imageId = `img_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Deteksi MIME type yang benar berdasarkan ekstensi file
      const getProperMimeType = (fileName: string, assetType?: string) => {
        const extension = fileName.toLowerCase().split(".").pop();
        switch (extension) {
          case "jpg":
          case "jpeg":
            return "image/jpeg";
          case "png":
            return "image/png";
          case "gif":
            return "image/gif";
          case "webp":
            return "image/webp";
          default:
            return assetType && assetType.startsWith("image/")
              ? assetType
              : "image/jpeg";
        }
      };

      const fileName = asset.fileName || `image_${imageId}.jpg`;
      const properMimeType = getProperMimeType(fileName, asset.type);

      console.log("🔍 File type detection:", {
        originalType: asset.type,
        fileName: fileName,
        detectedType: properMimeType,
      });

      // Buat object ImageData
      const newImage: ImageData = {
        id: imageId,
        uri: asset.uri,
        name: fileName,
        type: properMimeType, // Use properly detected MIME type
        size: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
        uploading: false,
        uploaded: false,
      };

      // Tambahkan gambar ke array
      const updatedImages = [...images, newImage];
      onImagesChange(updatedImages);

      // Auto upload gambar ke server
      await uploadImageToServer(newImage, updatedImages);
    } catch (error) {
      console.error("Error handling selected image:", error);
      Alert.alert("Error", "Gagal memproses gambar yang dipilih");
    }
  };

  // Fungsi untuk memproses multiple gambar yang dipilih dari galeri
  const handleMultipleImagesSelected = async (
    assets: ImagePicker.ImagePickerAsset[]
  ) => {
    try {
      const validImages: ImageData[] = [];
      const oversizedImages: string[] = [];

      // Validate semua gambar terlebih dahulu
      for (const asset of assets) {
        // Cek apakah masih ada slot untuk gambar baru
        if (images.length + validImages.length >= maxImages) {
          Alert.alert(
            "Info",
            `Hanya ${maxImages - images.length} gambar yang bisa ditambahkan`
          );
          break;
        }

        // Dapatkan informasi file
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);

        // Cek ukuran file
        if (fileInfo.exists && "size" in fileInfo && fileInfo.size > maxSize) {
          const fileName = asset.fileName || "Unknown file";
          oversizedImages.push(fileName);
          continue; // Skip file ini, lanjut ke file berikutnya
        }

        // Generate unique ID untuk gambar
        const imageId = `img_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}_${validImages.length}`;

        // Deteksi MIME type yang benar berdasarkan ekstensi file
        const getProperMimeType = (fileName: string, assetType?: string) => {
          const extension = fileName.toLowerCase().split(".").pop();
          switch (extension) {
            case "jpg":
            case "jpeg":
              return "image/jpeg";
            case "png":
              return "image/png";
            case "gif":
              return "image/gif";
            case "webp":
              return "image/webp";
            default:
              return assetType && assetType.startsWith("image/")
                ? assetType
                : "image/jpeg";
          }
        };

        const fileName = asset.fileName || `image_${imageId}.jpg`;
        const properMimeType = getProperMimeType(fileName, asset.type);

        console.log("🔍 Multiple file type detection:", {
          originalType: asset.type,
          fileName: fileName,
          detectedType: properMimeType,
          index: validImages.length,
        });

        // Buat object ImageData
        const newImage: ImageData = {
          id: imageId,
          uri: asset.uri,
          name: fileName,
          type: properMimeType, // Use properly detected MIME type
          size: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
          uploading: false,
          uploaded: false,
        };

        validImages.push(newImage);
      }

      // Tampilkan peringatan untuk file yang terlalu besar
      if (oversizedImages.length > 0) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        Alert.alert(
          "Beberapa gambar tidak dapat diupload",
          `File berikut melebihi ${sizeMB}MB:\n${oversizedImages.join("\n")}`
        );
      }

      // Jika tidak ada gambar valid, keluar
      if (validImages.length === 0) {
        if (oversizedImages.length > 0) {
          return; // Error message sudah ditampilkan di atas
        }
        Alert.alert("Error", "Tidak ada gambar yang valid untuk diupload");
        return;
      }

      // Tambahkan semua gambar valid ke array
      const updatedImages = [...images, ...validImages];
      onImagesChange(updatedImages);

      // Upload semua gambar ke server secara bersamaan (parallel)
      const uploadPromises = validImages.map((imageData) =>
        uploadImageToServer(imageData, updatedImages)
      );

      // Tunggu semua upload selesai
      await Promise.allSettled(uploadPromises);

      // Tampilkan notifikasi berhasil
      Alert.alert(
        "Berhasil",
        `${validImages.length} gambar berhasil ditambahkan`
      );
    } catch (error) {
      console.error("Error handling multiple selected images:", error);
      Alert.alert("Error", "Gagal memproses gambar yang dipilih");
    }
  };

  // Fungsi untuk upload gambar ke server (Minio via Next.js API)
  const uploadImageToServer = async (
    imageData: ImageData,
    currentImages: ImageData[]
  ) => {
    try {
      // Update status uploading
      const updatedImages = currentImages.map((img) =>
        img.id === imageData.id ? { ...img, uploading: true } : img
      );
      onImagesChange(updatedImages);

      // Persiapan FormData untuk upload sesuai API documentation
      const formData = new FormData();

      // Tambahkan file ke FormData (required field)
      formData.append("file", {
        uri: imageData.uri,
        type: imageData.type,
        name: imageData.name,
      } as any);

      // Optional metadata - uncomment jika API backend membutuhkan
      // formData.append("bucket", "siger");           // Optional: default bucket
      // formData.append("folder", "dokumentasi-harian"); // Optional: custom folder
      // formData.append("originalName", imageData.name);  // Optional: untuk penamaan yang lebih baik

      // Get API base URL
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

      console.log("🚀 Starting upload to:", `${API_BASE_URL}/api/upload-image`);

      // Test network connectivity first
      try {
        console.log("🌐 Testing network connectivity...");
        const testResponse = await fetch(`${API_BASE_URL}/api/full-projects`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        console.log("✅ Network test response:", testResponse.status);
      } catch (testError) {
        console.error("❌ Network test failed:", testError);
        throw new Error(
          "Network connectivity test failed. Check your connection."
        );
      }
      console.log("📝 Image info:", {
        name: imageData.name,
        type: imageData.type,
        size: imageData.size,
        uri: imageData.uri.substring(0, 50) + "...",
      });

      // Log FormData contents for debugging
      console.log("📋 FormData contents:");
      console.log("- file.name:", imageData.name);
      console.log("- file.type:", imageData.type);
      console.log("- file.uri length:", imageData.uri.length);

      // Upload ke server - FIXED: Remove Content-Type header untuk multipart/form-data
      // Browser/React Native akan auto-set dengan boundary yang benar
      const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Upload failed response:", errorText);
        throw new Error(
          `Upload failed with status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("✅ Upload response:", result);

      if (result.success) {
        // Update status berhasil upload
        const finalImages = currentImages.map((img) =>
          img.id === imageData.id
            ? {
                ...img,
                uploading: false,
                uploaded: true,
                minioPath: result.data.path,
                minioFileName: result.data.fileName,
              }
            : img
        );
        onImagesChange(finalImages);
        console.log("✅ Image uploaded successfully:", {
          fileName: result.data.fileName,
          path: result.data.path,
          stored: {
            minioPath: result.data.path,
            minioFileName: result.data.fileName,
          },
        });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);

      // More detailed error logging
      if (
        error instanceof TypeError &&
        error.message === "Network request failed"
      ) {
        const apiUrl =
          process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
        console.error("🌐 Network Error Details:");
        console.error("- Check if API server is running");
        console.error("- Check if device can reach the API URL");
        console.error("- API URL:", apiUrl);
        console.error(
          "- Try curl test:",
          `curl -X POST ${apiUrl}/api/upload-image`
        );
      }

      // Update status error
      const errorImages = currentImages.map((img) =>
        img.id === imageData.id
          ? {
              ...img,
              uploading: false,
              uploaded: false,
              error: (error as Error).message || "Upload gagal",
            }
          : img
      );
      onImagesChange(errorImages);

      const apiUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
      Alert.alert(
        "Error Upload",
        `Gagal mengupload gambar.\n\nDetail: ${
          (error as Error).message
        }\n\nAPI: ${apiUrl}/api/upload-image`
      );
    }
  };

  // Fungsi untuk menghapus gambar
  const deleteImage = async (imageId: string) => {
    try {
      const imageToDelete = images.find((img) => img.id === imageId);

      if (!imageToDelete) return;

      // Jika gambar sudah diupload ke server, hapus dari server juga
      if (imageToDelete.uploaded && imageToDelete.minioPath) {
        await deleteImageFromServer(imageToDelete.minioPath);
      }

      // Hapus dari array lokal
      const updatedImages = images.filter((img) => img.id !== imageId);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Gagal menghapus gambar");
    }
  };

  // Fungsi untuk menghapus gambar dari server
  const deleteImageFromServer = async (filePath: string) => {
    try {
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

      console.log("🗑️ Deleting image from server:", filePath);

      const response = await fetch(`${API_BASE_URL}/api/delete-image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket: "siger",
          fileName: filePath, // This should be the full path from upload response
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Image deleted successfully from server");
      } else {
        console.warn("❌ Failed to delete image from server:", result.message);
      }
    } catch (error) {
      console.error("❌ Error deleting image from server:", error);
    }
  };

  // Fungsi untuk konfirmasi hapus gambar
  const confirmDeleteImage = (imageId: string, imageName: string) => {
    Alert.alert(
      "Hapus Gambar",
      `Apakah Anda yakin ingin menghapus ${imageName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteImage(imageId),
        },
      ]
    );
  };

  // Render item gambar dalam list
  const renderImageItem = ({ item }: { item: ImageData }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.imagePreview} />

      {/* Overlay untuk status upload */}
      {(item.uploading || item.error) && (
        <View style={styles.imageOverlay}>
          {item.uploading && (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </>
          )}
          {item.error && <Text style={styles.errorText}>❌ {item.error}</Text>}
        </View>
      )}

      {/* Indikator berhasil upload */}
      {item.uploaded && !item.uploading && !item.error && (
        <View style={styles.successIndicator}>
          <Text style={styles.successText}>✓</Text>
        </View>
      )}

      {/* Tombol hapus */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDeleteImage(item.id, item.name)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>

      {/* Info ukuran file */}
      <Text style={styles.imageSizeText}>
        {(item.size / (1024 * 1024)).toFixed(1)} MB
      </Text>
    </View>
  );

  return (
    <View style={styles.imageUploadContainer}>
      {/* Header dengan info */}
      <View style={styles.imageUploadHeader}>
        <Text style={styles.imageUploadTitle}>
          Gambar Kegiatan ({images.length}/{maxImages})
        </Text>
        <Text style={styles.imageUploadSubtitle}>
          Max {(maxSize / (1024 * 1024)).toFixed(0)}MB per gambar
        </Text>
      </View>

      {/* Tombol tambah gambar */}
      {images.length < maxImages && (
        <TouchableOpacity
          style={styles.addImageButton}
          onPress={showImageSourceOptions}
        >
          <Text style={styles.addImageButtonText}>
            📷 Tambah Gambar ({maxImages - images.length} slot tersisa)
          </Text>
          <Text style={styles.addImageSubText}>
            Kamera: 1 foto • Galeri: Multiple foto
          </Text>
        </TouchableOpacity>
      )}

      {/* List gambar yang sudah dipilih */}
      {images.length > 0 && (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesList}
          contentContainerStyle={styles.imagesListContent}
        />
      )}

      {/* Info status upload */}
      {images.length > 0 && (
        <View style={styles.uploadStatusContainer}>
          <Text style={styles.uploadStatusText}>
            {images.filter((img) => img.uploaded).length} dari {images.length}{" "}
            gambar berhasil diupload
          </Text>
        </View>
      )}
    </View>
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
  const [koordinat, setKoordinat] = useState("");

  // State untuk mengelola gambar yang diupload
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);

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

      // Get API base URL from environment variables
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

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
      const currentApiUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
      Alert.alert(
        "Koneksi Gagal",
        `Tidak dapat terhubung ke API server. Pastikan:\n\n1. API server berjalan di ${currentApiUrl}\n2. HP dan komputer dalam WiFi yang sama\n\nMenggunakan data demo untuk sementara.`,
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
      // Get API base URL from environment variables
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

      // Siapkan data files dari gambar yang sudah diupload
      const uploadedFiles = uploadedImages
        .filter((img) => img.uploaded && img.minioFileName && img.minioPath)
        .map((img) => ({
          file: img.minioFileName!,
          path: img.minioPath!,
        }));

      // Prepare payload according to API specification
      const payload = {
        user_id: "cmfb8i5yo0000vpgc5p776720",
        sub_activities_id: selectedSubActivity,
        tanggal_progres: tanggalProgres,
        progres_realisasi_per_hari: parseFloat(progress) || 0,
        koordinat: {
          latitude: -6.2088, // Dummy coordinates (Jakarta)
          longitude: 106.8456,
        },
        catatan_kegiatan: catatan.trim(),
        files: uploadedFiles, // Gunakan files yang sudah diupload
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.topbarTitle}>Buat Laporan Harian</Text>
          <View style={styles.backButton} />
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Buat Laporan Harian</Text>
        <View style={styles.backButton} />
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
            {/* Komponen Upload Gambar */}
            <View style={styles.formGroup}>
              <ImageUploadComponent
                images={uploadedImages}
                onImagesChange={setUploadedImages}
                maxImages={5}
                maxSize={5 * 1024 * 1024} // 5MB
              />
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
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  // Styles untuk komponen upload gambar
  imageUploadContainer: {
    marginVertical: 8,
  },
  imageUploadHeader: {
    marginBottom: 12,
  },
  imageUploadTitle: {
    fontSize: 14,
    color: "#101828",
    fontWeight: "600",
    marginBottom: 4,
  },
  imageUploadSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  addImageButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  addImageButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  addImageSubText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
  imagesList: {
    marginVertical: 8,
  },
  imagesListContent: {
    paddingRight: 16,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  uploadingText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  successIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#10b981",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 16,
  },
  imageSizeText: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    fontSize: 8,
    textAlign: "center",
    paddingVertical: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  uploadStatusContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  uploadStatusText: {
    fontSize: 12,
    color: "#0369a1",
    textAlign: "center",
  },
});
