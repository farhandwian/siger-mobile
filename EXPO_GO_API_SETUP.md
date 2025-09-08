# Cara Menjalankan API Server untuk Expo Go

## Masalah
Ketika menggunakan Expo Go di HP, aplikasi tidak bisa mengakses `localhost` dari komputer karena HP dan komputer berada di network yang berbeda.

## Solusi
API server harus berjalan di IP address yang sama dengan Expo server: `192.168.11.122`

## Langkah-langkah:

### 1. Cek IP Address Komputer
Dari output Expo server, IP address komputer adalah: `192.168.11.122`

### 2. Jalankan API Server di IP Address Tersebut

#### Jika menggunakan Node.js/Express:
```bash
# Ganti localhost dengan 0.0.0.0 agar bisa diakses dari network
node server.js --host 0.0.0.0 --port 3000

# Atau jika ada script npm
npm start -- --host 0.0.0.0 --port 3000
```

#### Jika menggunakan framework lain:
- **Next.js**: `npm run dev -- -H 0.0.0.0 -p 3000`
- **Express**: Ubah `app.listen(3000)` menjadi `app.listen(3000, '0.0.0.0')`
- **NestJS**: `npm run start:dev -- --host 0.0.0.0`

### 3. Test dari Browser
Buka di browser komputer: `http://192.168.11.122:3000/api/full-projects`
Harus mengembalikan response JSON yang benar.

### 4. Test dari HP
Setelah API server berjalan di `0.0.0.0:3000`, aplikasi Expo Go di HP akan bisa mengakses:
`http://192.168.11.122:3000/api/full-projects`

## Troubleshooting:

### Jika masih error:
1. **Firewall**: Matikan Windows Firewall sementara
2. **Network**: Pastikan HP dan komputer terhubung ke WiFi yang sama
3. **Port**: Pastikan port 3000 tidak diblokir
4. **API Server**: Pastikan API server benar-benar berjalan di `0.0.0.0:3000`

### Cara cek apakah API server sudah benar:
```bash
# Dari komputer, test:
curl http://192.168.11.122:3000/api/full-projects

# Atau buka di browser:
http://192.168.11.122:3000/api/full-projects
```

## Catatan:
- `localhost` hanya bisa diakses dari komputer yang sama
- `0.0.0.0` memungkinkan akses dari network lain (termasuk HP)
- IP `192.168.11.122` adalah IP komputer di network WiFi
