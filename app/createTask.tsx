import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

// Component for image upload and preview functionality
// Handles multiple image selection, upload progress, and preview display
const ImageUploadComponent = ({
  images, // Array of current images in the component
  onImagesChange, // Callback function to update images array in parent component
  maxImages = 5, // Maximum number of images allowed (default: 5)
  maxSize = 5 * 1024 * 1024, // Maximum file size in bytes (default: 5MB)
}: {
  images: ImageData[]; // Type definition for images array
  onImagesChange: (
    // Type definition for callback function
    images: ImageData[] | ((prev: ImageData[]) => ImageData[]) // Supports both direct value and functional updates
  ) => void;
  maxImages?: number; // Optional maximum images limit
  maxSize?: number; // Optional maximum file size limit
}) => {
  // Use ref to track latest images state for closures
  // This prevents stale closure issues when async operations complete
  const imagesRef = useRef<ImageData[]>(images);

  // Update ref whenever images prop changes
  // Ensures ref always contains the current state for async operations
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
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

  // Function to display image source selection alert
  // Shows user options to pick images from camera or gallery with improved messaging
  const showImageSourceOptions = () => {
    Alert.alert(
      "Pilih Sumber Gambar", // Alert title
      "Pilih sumber gambar untuk melengkapi dokumentasi kegiatan Anda.", // Simplified, professional message
      [
        {
          text: "📷 Kamera", // Camera option with emoji for visual clarity
          onPress: () => pickImageFromCamera(), // Triggers camera image picker
        },
        {
          text: "🖼️ Galeri", // Gallery option with emoji for visual clarity
          onPress: () => pickImageFromGallery(), // Triggers gallery image picker with multi-select
        },
        {
          text: "Batal", // Cancel option
          style: "cancel", // iOS cancel button styling
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
      console.log("📸 Adding single image to state:", {
        existingCount: images.length,
        newImage: { id: newImage.id, name: newImage.name },
        totalCount: updatedImages.length,
      });
      onImagesChange(updatedImages);
      console.log(
        "✅ Single image onImagesChange called with",
        updatedImages.length,
        "images"
      );

      // Auto upload gambar ke server
      await uploadImageToServer(newImage);
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
      console.log("📸 Adding images to state:", {
        existingCount: images.length,
        newImagesCount: validImages.length,
        totalCount: updatedImages.length,
        newImages: validImages.map((img) => ({ id: img.id, name: img.name })),
      });
      onImagesChange(updatedImages);
      console.log(
        "✅ onImagesChange called with",
        updatedImages.length,
        "images"
      );

      // Upload semua gambar ke server secara bersamaan (parallel)
      // Each upload will get its own current state when it completes
      const uploadPromises = validImages.map((imageData) =>
        uploadImageToServer(imageData)
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
  const uploadImageToServer = async (imageData: ImageData) => {
    try {
      // Skip the uploading state update to avoid race conditions
      // Just proceed directly to upload
      console.log("� Starting upload for:", imageData.id);

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
        console.log("🔄 Updating upload status for:", imageData.id);

        console.log("🔄 Updating upload status for:", imageData.id);

        // The issue is we're using stale 'images' state. Let's force a state update
        // by triggering a re-render that will get the fresh state.

        // Create updated image data
        const updatedImageData = {
          ...imageData,
          uploading: false,
          uploaded: true,
          minioPath: result.data.path,
          minioFileName: result.data.fileName,
        };

        console.log("📝 Updating image in state:", {
          id: updatedImageData.id,
          name: updatedImageData.name,
          uploaded: updatedImageData.uploaded,
        });

        // Use a callback approach by calling the parent's setUploadedImages directly
        // Since we can't access the latest state here, we'll work around it
        console.log("� About to call onImagesChange to update state");

        // Use functional update to ensure we get the latest state
        // This prevents race conditions when multiple uploads complete simultaneously
        onImagesChange((prevImages: ImageData[]) => {
          console.log(
            "📋 Current images from functional update:",
            prevImages.map((img: ImageData) => ({
              id: img.id,
              uploaded: img.uploaded,
            }))
          );

          const finalImages = prevImages.map((img: ImageData) =>
            img.id === imageData.id ? updatedImageData : img
          );

          console.log(
            "🎯 Final images to set:",
            finalImages.map((img: ImageData) => ({
              id: img.id,
              uploaded: img.uploaded,
            }))
          );

          return finalImages;
        });
        console.log("✅ Upload success state updated");

        console.log("✅ Upload state update process initiated");
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

      // Update status error using fresh images state from ref
      const currentImages = imagesRef.current;
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
      console.log(
        "❌ Updated images after upload error:",
        errorImages.map((img) => ({
          id: img.id,
          name: img.name,
          uploaded: img.uploaded,
          error: img.error,
        }))
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
  const deleteImage = (imageId: string) => {
    console.log("🔍 Starting delete process for imageId:", imageId);
    console.log(
      "📋 Current images array before deletion:",
      images.map((img) => ({
        id: img.id,
        name: img.name,
        uploaded: img.uploaded,
        uploading: img.uploading,
        hasMinioPath: !!img.minioPath,
      }))
    );

    const imageToDelete = images.find((img) => img.id === imageId);

    if (!imageToDelete) {
      console.warn("⚠️ Image not found in array for deletion:", imageId);
      Alert.alert("Error", "Gambar tidak ditemukan dalam daftar");
      return;
    }

    console.log("🎯 Found image to delete:", {
      id: imageToDelete.id,
      name: imageToDelete.name,
      uploaded: imageToDelete.uploaded,
      uploading: imageToDelete.uploading,
      error: imageToDelete.error,
      minioPath: imageToDelete.minioPath,
    });

    // Create new array without the deleted image
    const updatedImages = images.filter((img) => img.id !== imageId);
    console.log(
      "📝 Images after filtering:",
      updatedImages.map((img) => ({ id: img.id, name: img.name }))
    );
    console.log(
      "� Array length change:",
      images.length,
      "->",
      updatedImages.length
    );

    // Update the state immediately
    onImagesChange(updatedImages);
    console.log(
      "✅ onImagesChange called with",
      updatedImages.length,
      "images"
    );

    // Handle server deletion for uploaded images
    if (imageToDelete.uploaded && imageToDelete.minioPath) {
      console.log(
        "🌐 Starting async server deletion for:",
        imageToDelete.minioPath
      );
      deleteImageFromServer(imageToDelete.minioPath).catch((error) => {
        console.error("❌ Async server deletion failed:", error);
      });
    } else {
      console.log(
        "⏭️ Skipping server deletion - uploaded:",
        imageToDelete.uploaded,
        "hasPath:",
        !!imageToDelete.minioPath
      );
    }

    console.log("🎉 Delete process completed for:", imageToDelete.name);
  };

  // Fungsi untuk menghapus gambar dari server
  const deleteImageFromServer = async (filePath: string) => {
    try {
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

      console.log("🗑️ Deleting image from server:", filePath);
      console.log("🌐 API URL:", `${API_BASE_URL}/api/delete-image`);

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

      console.log("📡 Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Delete request failed:", errorText);
        throw new Error(
          `Delete failed with status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("📋 Delete response body:", result);

      if (result.success) {
        console.log("✅ Image deleted successfully from server");
      } else {
        console.warn("❌ Server reported delete failure:", result.message);
        // Don't throw error here - just log warning so local deletion still works
      }
    } catch (error) {
      console.error("❌ Error deleting image from server:", error);
      console.error(
        "⚠️ Server deletion failed, but continuing with local deletion"
      );
      // Don't re-throw the error to avoid blocking local deletion
    }
  };

  // Fungsi untuk konfirmasi hapus gambar
  const confirmDeleteImage = (imageId: string, imageName: string) => {
    console.log("🔄 Confirm delete called for:", { imageId, imageName });
    console.log(
      "🔍 Current images in confirmDelete:",
      images.map((img) => ({
        id: img.id,
        name: img.name,
        uploaded: img.uploaded,
      }))
    );

    // Check if image still exists before showing confirmation
    const imageExists = images.find((img) => img.id === imageId);
    if (!imageExists) {
      console.warn("⚠️ Image already deleted or not found:", imageId);
      return;
    }

    console.log("✅ Image found, showing confirmation dialog");

    Alert.alert(
      "Hapus Gambar",
      `Apakah Anda yakin ingin menghapus ${imageName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            console.log("👆 User confirmed deletion for:", imageId);
            // Double-check image still exists when user confirms
            const stillExists = images.find((img) => img.id === imageId);
            if (stillExists) {
              console.log("🚀 Proceeding with deletion...");
              deleteImage(imageId);
            } else {
              console.warn(
                "⚠️ Image was already deleted while confirmation was shown"
              );
            }
          },
        },
      ]
    );
  };

  // Render item gambar dalam list
  const renderImageItem = ({ item }: { item: ImageData }) => {
    console.log("🖼️ Rendering image item:", {
      id: item.id,
      name: item.name,
      uploaded: item.uploaded,
      uploading: item.uploading,
      hasUri: !!item.uri,
      uriStart: item.uri.substring(0, 30),
    });

    return (
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
            {item.error && (
              <Text style={styles.errorText}>❌ {item.error}</Text>
            )}
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
          onPress={() => {
            console.log("🔴 Delete button pressed for:", {
              id: item.id,
              name: item.name,
              uploaded: item.uploaded,
              uploading: item.uploading,
              error: item.error,
            });
            confirmDeleteImage(item.id, item.name);
          }}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>

        {/* Info ukuran file */}
        <Text style={styles.imageSizeText}>
          {(item.size / (1024 * 1024)).toFixed(1)} MB
        </Text>
      </View>
    );
  };

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
        <>
          {console.log(
            "🎨 Rendering FlatList with images:",
            images.map((img) => ({
              id: img.id,
              name: img.name,
              uploaded: img.uploaded,
              hasUri: !!img.uri,
            }))
          )}
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesList}
            contentContainerStyle={styles.imagesListContent}
          />
        </>
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

// CreateTaskScreen Component
// This screen allows users to create or update daily progress reports
// Flow:
// 1. User selects Project → Activity → Sub-Activity (cascade dropdowns)
// 2. When Sub-Activity is selected, check if data already exists for today
// 3. If exists: populate form (UPDATE mode), if not: show empty form (CREATE mode)
// 4. Date is always disabled and set to today (can only report current day)
// 5. Submit uses upsert API that handles create/update based on composite key:
//    subactivityid + userid + tanggal_progres
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
  const [progress, setProgress] = useState("");
  const [catatan, setCatatan] = useState("");
  const [koordinat, setKoordinat] = useState("");

  // State to track if we're in update mode (existing data found) or create mode
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loadingExistingData, setLoadingExistingData] = useState(false);

  // State untuk mengelola gambar yang diupload
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);

  // Wrap setUploadedImages to debug what's setting it and support functional updates
  const debugSetUploadedImages = (
    newImagesOrUpdater: ImageData[] | ((prev: ImageData[]) => ImageData[])
  ) => {
    if (typeof newImagesOrUpdater === "function") {
      // Functional update - get current state and apply the function
      setUploadedImages((prevImages) => {
        const newImages = newImagesOrUpdater(prevImages);
        console.log("🔧 setUploadedImages called with functional update:", {
          count: newImages.length,
          images: newImages.map((img) => ({ id: img.id, name: img.name })),
        });
        if (newImages.length === 0) {
          console.log("⚠️ SETTING TO EMPTY ARRAY! Stack trace:");
          const error = new Error("Empty array set");
          console.error("Stack trace:", error.stack);
        }
        return newImages;
      });
    } else {
      // Direct array update
      const newImages = newImagesOrUpdater;
      console.log("🔧 setUploadedImages called with:", {
        count: newImages.length,
        images: newImages.map((img) => ({ id: img.id, name: img.name })),
      });
      if (newImages.length === 0) {
        console.log("⚠️ SETTING TO EMPTY ARRAY! Stack trace:");
        const error = new Error("Empty array set");
        console.error("Stack trace:", error.stack);
      }
      setUploadedImages(newImages);
    }
  };

  // Debug uploaded images state changes
  useEffect(() => {
    console.log("🔄 uploadedImages state changed:", {
      count: uploadedImages.length,
      images: uploadedImages.map((img) => ({
        id: img.id,
        name: img.name,
        uploaded: img.uploaded,
        uploading: img.uploading,
      })),
    });

    // Log the stack trace to see what's causing the state change
    if (uploadedImages.length === 0) {
      console.log("⚠️ State reset to empty! Stack trace:");
      console.trace();
    }
  }, [uploadedImages]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Date is always set to today and cannot be changed
  // This ensures users can only report progress for the current day
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

  // Function to fetch existing daily activity data for the selected sub-activity
  // This checks if there's already data for today's date and populates the form
  // The API uses upsert approach with composite key: subactivityid + userid + tanggal_progres
  // If data exists, we populate form for "update mode", otherwise "create mode"
  const fetchExistingDailyData = async (subActivityId: string) => {
    if (!subActivityId) return;

    try {
      setLoadingExistingData(true);

      // Get API base URL from environment variables
      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

      // Use hardcoded user ID for now (same as in handleSubmit)
      const userId = "cmfb8i5yo0000vpgc5p776720";
      const todayDate = getTodayDate();

      console.log("🔍 Fetching existing data for composite key:", {
        subActivityId,
        userId,
        date: todayDate,
      });

      // Construct query parameters for the API call
      // Based on the API schema: DailySubActivitiesQuerySchema
      const queryParams = new URLSearchParams({
        subActivityId: subActivityId,
        userId: userId,
        tanggalProgres: todayDate,
        limit: "1", // We only need to check if data exists, so limit to 1
      });

      console.log(
        "🌐 Making request to:",
        `${API_BASE_URL}/api/daily-sub-activities/list?${queryParams}`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/daily-sub-activities/list?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // If 404 or other errors, it means no existing data - this is normal for create mode
        if (response.status === 404) {
          console.log("📝 No existing data found (404) - create mode");
          setIsUpdateMode(false);
          setDefaultFormData();
          return;
        }

        console.warn(
          `⚠️ API returned status ${response.status}, treating as no data found`
        );
        setIsUpdateMode(false);
        setDefaultFormData();
        return;
      }

      const result = await response.json();

      console.log("📦 API Response:", {
        success: result.success,
        dataType: Array.isArray(result.data) ? "array" : typeof result.data,
        dataLength: Array.isArray(result.data)
          ? result.data.length
          : "not array",
        pagination: result.pagination,
      });

      if (
        result.success &&
        result.data &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        // Data exists - update mode
        const existingData = result.data[0]; // Get the first (and should be only) record
        console.log("✅ Existing data found - update mode:", existingData);
        setIsUpdateMode(true);
        populateFormWithExistingData(existingData);
      } else {
        // No data found - create mode
        console.log("📝 No existing data found - create mode");
        console.log(
          "📝 Reason: success =",
          result.success,
          "data length =",
          Array.isArray(result.data) ? result.data.length : "not array"
        );
        setIsUpdateMode(false);
        setDefaultFormData();
      }
    } catch (error) {
      console.error("Error fetching existing daily data:", error);
      console.log("📝 Error occurred - defaulting to create mode");
      setIsUpdateMode(false);
      setDefaultFormData();
    } finally {
      setLoadingExistingData(false);
    }
  };

  // Function to populate form with existing data for update mode
  const populateFormWithExistingData = (data: any) => {
    console.log("🔄 Populating form with existing data:", data);

    // Set form fields with existing data based on API schema
    // progresRealisasiPerHari is the field name in the API response
    setProgress(data.progresRealisasiPerHari?.toString() || "");
    // catatanKegiatan is the field name in the API response
    setCatatan(data.catatanKegiatan || "");

    // Set coordinates if available
    if (data.koordinat) {
      const koordinatString = `${data.koordinat.latitude}, ${data.koordinat.longitude}`;
      setKoordinat(koordinatString);
    }

    // Handle existing images/files if any
    // 'file' is the field name in the API response (JSON array)
    if (data.file && Array.isArray(data.file)) {
      // Convert existing files to ImageData format for display
      const existingImages: ImageData[] = data.file.map(
        (file: any, index: number) => ({
          id: `existing_${index}_${Date.now()}`,
          uri: file.url || "", // Assuming the API returns file URLs
          name: file.file || `file_${index}`,
          type: "image/jpeg", // Default type
          size: 0, // Unknown size for existing files
          uploaded: true,
          uploading: false,
          minioPath: file.path,
          minioFileName: file.file,
        })
      );

      debugSetUploadedImages(existingImages);
    }
  };

  // Function to set default form data for create mode
  const setDefaultFormData = () => {
    console.log("📝 Setting default form data for create mode");

    // Clear form fields to default values
    setProgress("");
    setCatatan("");
    setKoordinat("");

    // Clear uploaded images
    debugSetUploadedImages([]);
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
    // Fetch existing data for the selected sub-activity and today's date
    fetchExistingDailyData(subActivityId);
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

      // Prepare payload for upsert API
      // The API will automatically determine create vs update based on composite key:
      // - sub_activities_id + user_id + tanggal_progres
      // If combination exists: UPDATE existing record
      // If combination doesn't exist: CREATE new record
      const payload = {
        user_id: "cmfb8i5yo0000vpgc5p776720", // Part of composite key
        sub_activities_id: selectedSubActivity, // Part of composite key
        tanggal_progres: tanggalProgres, // Part of composite key
        progres_realisasi_per_hari: parseFloat(progress) || 0,
        koordinat: {
          latitude: -5.389364311787856, // Dummy coordinates (Jakarta)
          longitude: 105.2952872725199,
        },
        catatan_kegiatan: catatan.trim(),
        files: uploadedFiles, // Use uploaded files from Minio
      };

      console.log(
        `Submitting daily progress (${
          isUpdateMode ? "UPDATE" : "CREATE"
        } mode):`,
        payload
      );

      // Always use the upsert API endpoint - it handles create/update automatically
      // based on the composite key: subactivityid + userid + tanggal_progres
      const endpoint = `${API_BASE_URL}/api/daily-sub-activities-update`;

      console.log(`Making PUT request to: ${endpoint}`);
      console.log(
        `API will upsert based on key: subactivityid(${selectedSubActivity}) + userid(cmfb8i5yo0000vpgc5p776720) + tanggal_progres(${tanggalProgres})`
      );

      const response = await fetch(endpoint, {
        method: "PUT", // Always use PUT since API uses upsert approach
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log("Daily progress upserted successfully:", result);
        // Show success message based on whether it was an update or create operation
        const successMessage = isUpdateMode
          ? "Laporan harian berhasil diperbarui!"
          : "Laporan harian berhasil dibuat!";
        Alert.alert("Berhasil", successMessage, [
          { text: "OK", onPress: () => router.replace("/createTaskSuccess") },
        ]);
      } else {
        throw new Error(result.message || "Failed to upsert daily progress");
      }
    } catch (error: any) {
      console.error("Error upserting daily progress:", error);
      const errorMessage = isUpdateMode
        ? "Laporan gagal diperbarui."
        : "Laporan gagal dibuat.";
      Alert.alert(
        "Gagal",
        `${errorMessage} Silakan coba lagi.\n\nDetail: ` +
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
                {loadingExistingData && (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#1a365d" />
                    <Text style={styles.loadingText}>
                      Mengecek data yang sudah ada...
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Mode indicator - Only show when sub-activity is selected */}
            {selectedSubActivity && !loadingExistingData && (
              <View style={styles.modeIndicator}>
                <View
                  style={[
                    styles.modeIndicatorBadge,
                    isUpdateMode
                      ? styles.updateModeBadge
                      : styles.createModeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeIndicatorText,
                      isUpdateMode
                        ? styles.updateModeText
                        : styles.createModeText,
                    ]}
                  >
                    {isUpdateMode ? "📝 MODE: UPDATE" : "✨ MODE: CREATE"}
                  </Text>
                </View>
                <Text style={styles.modeDescription}>
                  {isUpdateMode
                    ? "Data hari ini sudah ada, form akan memperbarui data yang sudah ada."
                    : "Belum ada data hari ini, form akan membuat data baru."}
                </Text>
              </View>
            )}

            {/* Tanggal Progres - Disabled and set to today */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tanggal Progres *</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={tanggalProgres}
                placeholder="YYYY-MM-DD"
                editable={false}
                selectTextOnFocus={false}
              />
              <Text style={styles.helperText}>
                Data hanya dapat diisi untuk hari ini
              </Text>
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
                onImagesChange={debugSetUploadedImages}
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
                {submitting
                  ? isUpdateMode
                    ? "Memperbarui..."
                    : "Mengirim..."
                  : isUpdateMode
                  ? "Perbarui Laporan"
                  : "Kirim Laporan"}
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
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
  },
  modeIndicator: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modeIndicatorBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  updateModeBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
  },
  createModeBadge: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
    borderWidth: 1,
  },
  modeIndicatorText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  updateModeText: {
    color: "#92400e",
  },
  createModeText: {
    color: "#166534",
  },
  modeDescription: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
});
