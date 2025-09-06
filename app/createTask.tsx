import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const pekerjaanDummy = [
  "REHABILITASI/ PENINGKATAN BANGUNAN, PINTU AIR DAN JARINGAN IRIGASI DI/DIR di KABUPATEN LAMPUNG TENGAH DAN KABUPATEN LAMPUNG TIMUR",
  "PEMBANGUNAN JEMBATAN BARU",
  "PERBAIKAN SALURAN IRIGASI",
];
const kegiatanDummy = [
  "Galian Tanah di Rawa menggunakan Excavator Standar",
  "Pemasangan Pintu Air",
  "Pengecoran Saluran",
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const [pekerjaan, setPekerjaan] = useState(pekerjaanDummy[0]);
  const [kegiatan, setKegiatan] = useState(kegiatanDummy[0]);
  const [progress, setProgress] = useState("1.015");
  const [catatan, setCatatan] = useState(
    "Telah dilaksanakan mobilisasi untuk persiapan awal proyek. Kegiatan meliputi pembersihan lokasi dan pengiriman material tahap pertama."
  );
  const [koordinat, setKoordinat] = useState("");
  const [uploadImages, setUploadImages] = useState([]); // dummy, not implemented
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Simulate success/fail
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
      <Text style={styles.header}>Buat Laporan Harian</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pilih Pekerjaan *</Text>
        <TouchableOpacity style={styles.select} onPress={() => {}}>
          <Text>{pekerjaan}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pilih Kegiatan *</Text>
        <TouchableOpacity style={styles.select} onPress={() => {}}>
          <Text>{kegiatan}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Progress *</Text>
        <TextInput
          style={styles.input}
          value={progress}
          onChangeText={setProgress}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Catatan Kegiatan</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={catatan}
          onChangeText={setCatatan}
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Koordinat Lokasi</Text>
        <TextInput
          style={styles.input}
          value={koordinat}
          onChangeText={setKoordinat}
          placeholder="Cari lokasi..."
        />
      </View>
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
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Mengirim..." : "Kirim Laporan"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 16,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#101828",
    marginBottom: 4,
  },
  select: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
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
  },
  buttonText: {
    color: "#1a365d",
    fontWeight: "bold",
    fontSize: 16,
  },
});
