please make the ui follow the below instruction.

when application fist open, please display this:
https://www.figma.com/design/b20D1t97KXTnmihl9qnrme/SIGER?node-id=195-34560&t=hMz3lzXHACOpeeTt-11


after that please, create login display with dummy data, no need to have real login functionality only display it, user can input anything.


make this createTask ui:
https://www.figma.com/design/b20D1t97KXTnmihl9qnrme/SIGER?node-id=195-34323&t=hMz3lzXHACOpeeTt-11

note for createTask figma:
-for data input pilih pekerjaan use dummy data 
-for data pilih kegiatan use dummy data
-on the figma is still haven't koordinat field, i want user can search location and chose the location.

if user click kirim laporan button and success shown this:
https://www.figma.com/design/b20D1t97KXTnmihl9qnrme/SIGER?node-id=195-34872&t=hMz3lzXHACOpeeTt-11

if its fail shown ui which inform user that process has been failed

-------------------------------------------------
https://www.figma.com/design/b20D1t97KXTnmihl9qnrme/SIGER?node-id=195-34323&m=dev
------------------------------------------------

saya ingin input field pekerjaan muncul hanya ketika user sudah memilih salah satu data pada input field proyek. lalu input field kegiatan muncul hanya ketika user sudah memilih pekerjaan.

lalu untuk datanya tolong panggil api ini: 
http://localhost:3000/api/full-projects

api tersebut memiliki example response seperti ini:
{
  "success": true,
  "data": [
    {
      "id": "cm0txl9yk00015wjn8h2r3k7b",
      "pekerjaan": "Pembangunan Irigasi Desa Sukamaju",
      "penyediaJasa": "CV Maju Bersama",
      "nilaiKontrak": "Rp 5,500,000,000",
      "tanggalKontrak": "2025-01-15",
      "akhirKontrak": "2025-12-15",
      "fisikProgress": 25.5,
      "fisikTarget": 100,
      "activities": [
        {
          "id": "act001",
          "name": "Pekerjaan Persiapan",
          "order": 1,
          "subActivities": [
            {
              "id": "sub001",
              "name": "Pembersihan Lahan",
              "satuan": "m2",
              "volumeKontrak": 1500.0,
              "weight": 15.0,
              "order": 1
            },
            {
              "id": "sub002", 
              "name": "Pematokan",
              "satuan": "m",
              "volumeKontrak": 500.0,
              "weight": 10.0,
              "order": 2
            }
          ]
        },
        {
          "id": "act002",
          "name": "Pekerjaan Galian",
          "order": 2,
          "subActivities": [
            {
              "id": "sub003",
              "name": "Galian Saluran Primer",
              "satuan": "m3",
              "volumeKontrak": 2500.0,
              "weight": 30.0,
              "order": 1
            },
            {
              "id": "sub004",
              "name": "Galian Saluran Sekunder",
              "satuan": "m3", 
              "volumeKontrak": 1200.0,
              "weight": 20.0,
              "order": 2
            }
          ]
        },
        {
          "id": "act003",
          "name": "Pekerjaan Struktur",
          "order": 3,
          "subActivities": [
            {
              "id": "sub005",
              "name": "Pemasangan Pintu Air",
              "satuan": "unit",
              "volumeKontrak": 5.0,
              "weight": 15.0,
              "order": 1
            },
            {
              "id": "sub006",
              "name": "Pembetonan Saluran",
              "satuan": "m",
              "volumeKontrak": 800.0,
              "weight": 10.0,
              "order": 2
            }
          ]
        }
      ]
    },
    {
      "id": "cm0txl9yk00025wjn8h2r3k8c",
      "pekerjaan": "Rehabilitasi Jaringan Irigasi Cikampek",
      "penyediaJasa": "PT Bangun Karya",
      "nilaiKontrak": "Rp 8,200,000,000",
      "tanggalKontrak": "2025-02-01",
      "akhirKontrak": "2026-01-31",
      "fisikProgress": 45.2,
      "fisikTarget": 100,
      "activities": [
        {
          "id": "act004",
          "name": "Pekerjaan Pembongkaran",
          "order": 1,
          "subActivities": [
            {
              "id": "sub007",
              "name": "Pembongkaran Struktur Lama",
              "satuan": "m3",
              "volumeKontrak": 800.0,
              "weight": 20.0,
              "order": 1
            }
          ]
        },
        {
          "id": "act005",
          "name": "Pekerjaan Rekonstruksi",
          "order": 2,
          "subActivities": [
            {
              "id": "sub008",
              "name": "Pembuatan Pondasi",
              "satuan": "m3",
              "volumeKontrak": 600.0,
              "weight": 25.0,
              "order": 1
            },
            {
              "id": "sub009",
              "name": "Pemasangan Dinding",
              "satuan": "m2",
              "volumeKontrak": 1500.0,
              "weight": 35.0,
              "order": 2
            },
            {
              "id": "sub010",
              "name": "Finishing",
              "satuan": "m2",
              "volumeKontrak": 1500.0,
              "weight": 20.0,
              "order": 3
            }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}

--------------------------------------
tolong buatkan input field tanggal yang mana nanti inputnya itu disablde dan disini dengan tanggal hari ini YYYY-MM-DD, jika pengguna megklik tombol kirim laporan maka akan menghit api PUT /api/daily-sub-activities-update, untuk koordinat dan files nya itu gunakan dummy data saja terlebih dahulu

# Quick Reference: Mobile Daily Progress API

## API Endpoint
```
PUT /api/daily-sub-activities-update
```

## Required Payload
```json
{
  "sub_activities_id": "string",
  "tanggal_progres": "YYYY-MM-DD", 
  "progres_realisasi_per_hari": 0-100
}
```

## Optional Fields
```json
{
  "koordinat": {
    "latitude": number,
    "longitude": number
  },
  "catatan_kegiatan": "string",
  "files": [
    {
      "file": "filename.jpg",
      "path": "/upload/path/filename.jpg"
    }
  ]
}
```

## Success Response
```json
{
  "success": true,
  "data": { /* updated record */ },
  "message": "Daily progress updated successfully"
}

---------------------------------------

tolonng buatkan ui untuk menampilkan list daily sub activities, dimana akan ada filter untuk data projects, activities, dan sub_activities, saya ingin ada juga search berdasarkan nama sub_activities. lalu tolong buatkan juga pagination mengguankan infinite scroll. lalu pada halaman tersebut tolong tambahkan button tambah laporan yang jika diklik akan meredirect ke app\createTask.tsx.


------------------------------------
tolong tambahkan input fied untuk mengupload gamba. user bisa mengupload gambar, melihat preview gambar yang sudah dimasukkan dan juga bisa menghapus gambar tesrebut. lalu ketika mengupdate, pada input field tersebut bisa me-load image-imagenya. 

gambar tersebut akan disimpan di minio, lalu data dari minio(nama filenya dan pathnya) tersebut lah yang akan disimpan kedalam db lewat payload key files dalam api daily-sub-activities-update. api be nya itu menggunakan next js. jadi tolong anda buatkan komponennya, dan jika pada kodenya perlu menghit api next js untuk mengupload, mendelete, dan mendownload filenya, tolong integrasikan saja dulu dan berikan juga dokumentasinya yang lengkap nanti saya akan buatkan apinya.

tolong juga berikan penjelsan pada kodenya supaya saya mudah memahami kodenya.

------------------------
ternyata setiap merfersesh data dibawahnya, datanya itu pasti kembali ke salah satu data dengan progres 9.96. jika terlalu suilit ubah pendekatan nya anda bisa menggunaakan ini @shopify/flash-list, dengan referensi kode ini:
https://medium.com/@andrew.chester/react-native-infinite-scrolling-with-lazy-loading-a-step-by-step-guide-e91647348689

tolong juga hilangkana bagina tampilan menu yang ada tulisan home, explore, dan dailyactivitie. lalu tolong hilangkan bagian atas dari menu yang berbentuk rectagle bewarna abu-abu , lalu perkecil tampilan untuk search dan filternya, tujuannya adalah agar list data mendapatkan ruang, supaya pengguan lebih enak membacanya
-------------------------------

+++disini
please improve style of alert that triggered after click upload field. do not tell this "Anda bisa menambah ${remainingSlots} gambar lagi\n\n• Kamera: Ambil 1 foto\n• Galeri: Pilih beberapa foto sekaligus",

and on createTaskSucces when user click kembali ke beranda it should redirect back to listdailactivities