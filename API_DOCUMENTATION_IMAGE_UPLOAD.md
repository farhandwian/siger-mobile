# API Documentation untuk Image Upload

## Overview
Dokumentasi ini menjelaskan API endpoints yang diperlukan untuk fitur upload gambar dalam aplikasi SIGER Mobile. API ini akan digunakan untuk mengupload, menghapus, dan mendownload gambar yang disimpan di MinIO storage.

## MinIO Configuration
- **Bucket Name**: `siger`
- **Folder Path**: `dokumentasi-harian/`
- **Storage Structure**: `siger/dokumentasi-harian/{filename}`

## API Endpoints

### 1. Upload Image

**Endpoint**: `POST /api/upload-image`

**Description**: Upload gambar ke MinIO storage dan return informasi file yang sudah diupload.

**Request Format**: `multipart/form-data`

**Request Body**:
```typescript
{
  file: File,              // File gambar yang akan diupload
  bucket: string,          // Nama bucket MinIO (default: "siger")
  folder: string,          // Folder path (default: "dokumentasi-harian")
  originalName: string     // Nama file asli
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileName": "20241210_143025_img_abc123.jpg",
    "path": "/siger/dokumentasi-harian/20241210_143025_img_abc123.jpg",
    "originalName": "photo.jpg",
    "size": 1024000,
    "uploadedAt": "2024-12-10T14:30:25.000Z"
  }
}
```

**Response Error** (400/500):
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

**Implementation Notes**:
- Generate unique filename dengan format: `YYYYMMDD_HHMMSS_{originalId}.{extension}`
- Validate file type (hanya accept image: jpg, jpeg, png, webp)
- Validate file size (max 5MB)
- Store ke MinIO dengan path: `siger/dokumentasi-harian/{generatedFileName}`

### 2. Delete Image

**Endpoint**: `DELETE /api/delete-image`

**Description**: Hapus gambar dari MinIO storage.

**Request Body**:
```json
{
  "bucket": "siger",
  "fileName": "20241210_143025_img_abc123.jpg"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "fileName": "20241210_143025_img_abc123.jpg",
    "deletedAt": "2024-12-10T14:35:25.000Z"
  }
}
```

**Response Error** (400/500):
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### 3. Download/Preview Image (Optional)

**Endpoint**: `GET /api/download-image/:fileName`

**Description**: Download atau preview gambar dari MinIO.

**Parameters**:
- `fileName`: Nama file yang akan didownload

**Query Parameters**:
- `preview`: boolean - Jika true, return sebagai preview (content-type image)
- `download`: boolean - Jika true, force download

**Response**: Binary data (image file) atau redirect ke MinIO URL

## Integration dalam Mobile App

### 1. Install Required Packages

Tambahkan packages berikut ke `package.json`:

```bash
npx expo install expo-image-picker expo-file-system
```

### 2. Update Imports

Uncomment imports di `createTask.tsx`:

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
```

### 3. Remove Placeholder Code

Hapus namespace placeholder `ImagePicker` dan `FileSystem` setelah packages terinstall.

## Error Handling

### Common Error Cases:
1. **File too large**: Return 400 dengan message "File size exceeds 5MB limit"
2. **Invalid file type**: Return 400 dengan message "Only image files are allowed"
3. **MinIO connection error**: Return 500 dengan message "Storage service unavailable"
4. **File not found**: Return 404 dengan message "File not found"
5. **Upload failed**: Return 500 dengan message "Failed to upload file"

## MinIO Setup untuk Development

### Environment Variables (.env.local):
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=siger
```

### Example MinIO Client Setup (Next.js):
```typescript
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});
```

## Data Flow

1. **User picks image** → ImagePicker opens camera/gallery
2. **Image selected** → Validate size and type
3. **Auto upload** → Send to `/api/upload-image`
4. **Store metadata** → Update local state dengan MinIO path/filename
5. **Submit form** → Include files array in payload untuk API `daily-sub-activities-update`
6. **Delete image** → Call `/api/delete-image` dan update local state

## Security Considerations

1. **File validation**: Always validate file type dan size di server
2. **Authentication**: Implement authentication untuk API endpoints
3. **Rate limiting**: Implement rate limiting untuk upload endpoints
4. **File scanning**: Consider virus scanning untuk uploaded files
5. **Access control**: Implement proper access control untuk MinIO buckets

## Testing

### Test Cases:
1. Upload valid image file
2. Upload oversized file (>5MB)
3. Upload non-image file
4. Delete existing file
5. Delete non-existing file
6. Network error handling
7. MinIO service unavailable

### Sample Test Data:
- Valid image: JPG, PNG, WEBP under 5MB
- Invalid files: PDF, TXT, oversized images
- Network scenarios: timeout, connection refused

## Performance Optimization

1. **Image compression**: Implement client-side compression sebelum upload
2. **Thumbnail generation**: Generate thumbnails untuk preview
3. **Progressive upload**: Show upload progress
4. **Retry mechanism**: Implement retry untuk failed uploads
5. **Caching**: Cache uploaded images locally

## Monitoring

Track metrics:
- Upload success rate
- Average upload time
- File size distribution
- Error rates by type
- Storage usage

## Future Enhancements

1. **Multiple file upload**: Support batch upload
2. **Image editing**: Basic editing capabilities
3. **Cloud sync**: Sync dengan cloud storage
4. **Offline support**: Queue uploads when offline
5. **Image optimization**: Auto-optimize untuk different screen sizes
