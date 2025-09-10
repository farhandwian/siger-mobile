# Image Upload Feature - Panduan Lengkap

## Overview Fitur

Fitur upload gambar ini memungkinkan user untuk:
1. **Mengupload gambar** dari kamera atau galeri
2. **Melihat preview** gambar yang sudah diupload
3. **Menghapus gambar** yang tidak diinginkan
4. **Auto-upload** ke server MinIO storage
5. **Tracking status** upload (uploading, success, error)

## Komponen Utama

### 1. Interface ImageData
```typescript
interface ImageData {
  id: string;           // Unique identifier untuk gambar
  uri: string;          // URI lokal gambar di device
  name: string;         // Nama file asli
  type: string;         // MIME type (image/jpeg, image/png, dll)
  size: number;         // Ukuran file dalam bytes
  uploading?: boolean;  // Status sedang upload
  uploaded?: boolean;   // Status berhasil upload
  error?: string;       // Pesan error jika upload gagal
  minioPath?: string;   // Path file di MinIO setelah upload
  minioFileName?: string; // Nama file di MinIO
}
```

### 2. ImageUploadComponent
Komponen utama yang menangani semua functionality upload gambar.

#### Props:
- `images: ImageData[]` - Array gambar yang sudah dipilih
- `onImagesChange: (images: ImageData[]) => void` - Callback untuk update array gambar
- `maxImages?: number` - Maksimal jumlah gambar (default: 5)
- `maxSize?: number` - Maksimal ukuran file dalam bytes (default: 5MB)

## Alur Kerja (Flow)

### 1. Pilih Gambar
```typescript
// User tap tombol "Tambah Gambar"
showImageSourceOptions() → Alert dengan pilihan:
├── Kamera → pickImageFromCamera()
└── Galeri → pickImageFromGallery()
```

### 2. Validasi Gambar
```typescript
handleImageSelected(asset) → {
  ├── Cek jumlah maksimal gambar
  ├── Dapatkan info file (size, dll)
  ├── Validasi ukuran file
  ├── Generate unique ID
  └── Tambah ke array images
}
```

### 3. Auto Upload
```typescript
uploadImageToServer(imageData) → {
  ├── Update status "uploading"
  ├── Siapkan FormData
  ├── POST ke /api/upload-image
  ├── Update status berdasarkan response
  └── Simpan minioPath & minioFileName
}
```

### 4. Submit Form
```typescript
handleSubmit() → {
  ├── Filter gambar yang berhasil upload
  ├── Buat array files untuk payload
  └── Kirim ke API daily-sub-activities-update
}
```

## Penjelasan Kode Detail

### 1. Permission Handling
```typescript
const requestPermissions = async () => {
  // Minta izin akses kamera untuk foto
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  
  // Minta izin akses galeri untuk pilih foto existing
  const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  // Return true hanya jika kedua permission granted
  return cameraPermission.granted && mediaPermission.granted;
};
```

### 2. Image Selection
```typescript
const pickImageFromCamera = async () => {
  // Launch kamera dengan konfigurasi:
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // Hanya gambar
    allowsEditing: true,    // Allow basic editing (crop, rotate)
    aspect: [4, 3],         // Aspect ratio 4:3
    quality: 0.8,           // Kompresi 80% untuk reduce file size
  });
};
```

### 3. File Validation
```typescript
const handleImageSelected = async (asset) => {
  // Dapatkan informasi detail file
  const fileInfo = await FileSystem.getInfoAsync(asset.uri);
  
  // Validasi ukuran file
  if (fileInfo.size && fileInfo.size > maxSize) {
    // Tampilkan error jika file terlalu besar
    Alert.alert('Error', `Ukuran gambar tidak boleh lebih dari ${sizeMB}MB`);
    return;
  }
  
  // Generate unique ID untuk tracking
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

### 4. Upload Process
```typescript
const uploadImageToServer = async (imageData, currentImages) => {
  // 1. Update UI status ke "uploading"
  const updatedImages = currentImages.map(img => 
    img.id === imageData.id ? { ...img, uploading: true } : img
  );
  
  // 2. Siapkan FormData untuk multipart upload
  const formData = new FormData();
  formData.append('file', {
    uri: imageData.uri,
    type: imageData.type,
    name: imageData.name,
  });
  
  // 3. Kirim ke server
  const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  // 4. Handle response dan update status
  if (result.success) {
    // Update dengan data dari server
    finalImages = currentImages.map(img => 
      img.id === imageData.id ? { 
        ...img, 
        uploading: false, 
        uploaded: true,
        minioPath: result.data.path,
        minioFileName: result.data.fileName,
      } : img
    );
  }
};
```

### 5. Delete Functionality
```typescript
const deleteImage = async (imageId) => {
  const imageToDelete = images.find(img => img.id === imageId);
  
  // Jika gambar sudah diupload, hapus dari server juga
  if (imageToDelete.uploaded && imageToDelete.minioFileName) {
    await deleteImageFromServer(imageToDelete.minioFileName);
  }
  
  // Hapus dari array lokal
  const updatedImages = images.filter(img => img.id !== imageId);
  onImagesChange(updatedImages);
};
```

## UI Components Explained

### 1. Header dengan Counter
```typescript
<Text style={styles.imageUploadTitle}>
  Gambar Kegiatan ({images.length}/{maxImages})
</Text>
```
Menampilkan jumlah gambar saat ini vs maksimal yang diperbolehkan.

### 2. Add Button
```typescript
{images.length < maxImages && (
  <TouchableOpacity onPress={showImageSourceOptions}>
    <Text>+ Tambah Gambar</Text>
  </TouchableOpacity>
)}
```
Tombol untuk tambah gambar, hanya muncul jika belum mencapai limit.

### 3. Image Preview dengan Status
```typescript
const renderImageItem = ({ item }) => (
  <View style={styles.imageContainer}>
    {/* Preview gambar */}
    <Image source={{ uri: item.uri }} style={styles.imagePreview} />
    
    {/* Overlay untuk status upload */}
    {item.uploading && (
      <View style={styles.imageOverlay}>
        <ActivityIndicator size="small" color="#fff" />
        <Text>Uploading...</Text>
      </View>
    )}
    
    {/* Indikator success */}
    {item.uploaded && (
      <View style={styles.successIndicator}>
        <Text>✓</Text>
      </View>
    )}
    
    {/* Tombol delete */}
    <TouchableOpacity onPress={() => deleteImage(item.id)}>
      <Text>×</Text>
    </TouchableOpacity>
  </View>
);
```

### 4. Upload Status Summary
```typescript
<Text style={styles.uploadStatusText}>
  {images.filter(img => img.uploaded).length} dari {images.length} gambar berhasil diupload
</Text>
```
Menampilkan ringkasan berapa gambar yang sudah berhasil diupload.

## Error Handling

### 1. Permission Denied
```typescript
if (!hasPermissions) {
  Alert.alert('Error', 'Permission kamera dan galeri diperlukan');
  return;
}
```

### 2. File Size Exceeded
```typescript
if (fileInfo.size > maxSize) {
  Alert.alert('Error', `Ukuran gambar tidak boleh lebih dari ${sizeMB}MB`);
  return;
}
```

### 3. Upload Failed
```typescript
catch (error) {
  const errorImages = currentImages.map(img => 
    img.id === imageData.id ? { 
      ...img, 
      uploading: false, 
      uploaded: false,
      error: error.message || 'Upload gagal'
    } : img
  );
  Alert.alert('Error Upload', 'Gagal mengupload gambar. Coba lagi nanti.');
}
```

## Integration dengan Form Submit

### Payload Preparation
```typescript
const handleSubmit = async () => {
  // Filter hanya gambar yang berhasil diupload
  const uploadedFiles = uploadedImages
    .filter(img => img.uploaded && img.minioFileName && img.minioPath)
    .map(img => ({
      file: img.minioFileName!,
      path: img.minioPath!,
    }));

  // Include dalam payload API
  const payload = {
    // ... fields lain
    files: uploadedFiles, // Array files yang sudah diupload
  };
};
```

## Setup Instructions

### 1. Install Dependencies
```bash
npx expo install expo-image-picker expo-file-system
```

### 2. Update Imports
Uncomment imports di file:
```typescript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
```

### 3. Remove Placeholder Code
Hapus namespace placeholder setelah packages terinstall.

### 4. Configure Permissions (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them.",
          "cameraPermission": "The app accesses your camera to let you take photos."
        }
      ]
    ]
  }
}
```

## Best Practices

### 1. Performance
- Kompresi gambar dengan `quality: 0.8`
- Tampilkan loading indicator saat upload
- Implement retry mechanism untuk failed uploads

### 2. User Experience
- Preview gambar sebelum upload
- Clear error messages
- Konfirmasi sebelum delete
- Status upload yang jelas

### 3. Error Handling
- Graceful handling untuk semua error scenarios
- Fallback untuk permission denied
- Network error handling

### 4. Security
- Validate file type di client dan server
- Check file size limits
- Sanitize file names

## Testing Scenarios

1. **Happy Path**: Pilih gambar → Upload berhasil → Submit form
2. **Permission Denied**: Handle gracefully
3. **File Too Large**: Show appropriate error
4. **Network Error**: Retry mechanism
5. **Server Error**: Error handling
6. **Delete Image**: Before dan after upload
7. **Max Images**: Disable add button when limit reached

## Troubleshooting

### Common Issues:
1. **Permission not granted**: Check app.json configuration
2. **Upload fails**: Check API endpoint dan network
3. **File not found**: Handle asset URI changes
4. **Memory issues**: Implement proper image compression
5. **UI not updating**: Check state management

### Debug Tips:
- Enable console logs untuk track upload progress
- Check network tab untuk API calls
- Test dengan different file sizes dan types
- Test permission flow di real device
