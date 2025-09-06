import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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

export default function CreateTaskScreen() {
  const router = useRouter();
  // Dropdown states
  const [openPekerjaan, setOpenPekerjaan] = useState(false);
  const [pekerjaan, setPekerjaan] = useState(pekerjaanDummy[0].value);
  const [openKegiatan, setOpenKegiatan] = useState(false);
  const [kegiatan, setKegiatan] = useState(kegiatanDummy[0].value);
  const [openProyek, setOpenProyek] = useState(false);
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
            <View style={[styles.formGroup, { zIndex: openProyek ? 3000 : 1 }]}>
              <Text style={styles.label}>Pilih Proyek *</Text>
              <DropDownPicker
                open={openProyek}
                value={proyek}
                items={proyekDummy}
                setOpen={setOpenProyek}
                setValue={setProyek}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
                listItemLabelStyle={styles.dropdownLabel}
                listItemContainerStyle={styles.dropdownItemContainer}
                labelProps={{
                  numberOfLines: 0,
                  adjustsFontSizeToFit: false,
                  style: { flexWrap: "wrap", textAlign: "left", width: "100%" },
                }}
                autoScroll
                itemSeparator={true}
                itemSeparatorStyle={styles.dropdownSeparator}
                maxHeight={300}
              />
            </View>
            {/* Pekerjaan Dropdown */}
            <View
              style={[styles.formGroup, { zIndex: openPekerjaan ? 2000 : 1 }]}
            >
              <Text style={styles.label}>Pilih Pekerjaan *</Text>
              <DropDownPicker
                open={openPekerjaan}
                value={pekerjaan}
                items={pekerjaanDummy}
                setOpen={setOpenPekerjaan}
                setValue={setPekerjaan}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={2000}
                zIndexInverse={2000}
                listItemLabelStyle={styles.dropdownLabel}
                listItemContainerStyle={styles.dropdownItemContainer}
                labelProps={{
                  numberOfLines: 0,
                  adjustsFontSizeToFit: false,
                  style: { flexWrap: "wrap", textAlign: "left", width: "100%" },
                }}
                autoScroll
                itemSeparator={true}
                itemSeparatorStyle={styles.dropdownSeparator}
                maxHeight={300}
              />
            </View>
            {/* Kegiatan Dropdown */}
            <View
              style={[styles.formGroup, { zIndex: openKegiatan ? 1000 : 1 }]}
            >
              <Text style={styles.label}>Pilih Kegiatan *</Text>
              <DropDownPicker
                open={openKegiatan}
                value={kegiatan}
                items={kegiatanDummy}
                setOpen={setOpenKegiatan}
                setValue={setKegiatan}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
                zIndexInverse={3000}
                listItemLabelStyle={styles.dropdownLabel}
                listItemContainerStyle={styles.dropdownItemContainer}
                labelProps={{
                  numberOfLines: 0,
                  adjustsFontSizeToFit: false,
                  style: { flexWrap: "wrap", textAlign: "left", width: "100%" },
                }}
                autoScroll
                itemSeparator={true}
                itemSeparatorStyle={styles.dropdownSeparator}
                maxHeight={300}
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
  dropdown: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    minHeight: 44,
    marginBottom: 2,
  },
  dropdownContainer: {
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
    zIndex: 1000,
    maxHeight: 300,
  },
  dropdownLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: "#101828",
    paddingRight: 8,
    width: "100%",
    textAlign: "left",
    alignSelf: "stretch",
  },
  dropdownItemContainer: {
    minHeight: 100,
    height: "auto",
    alignItems: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    justifyContent: "center",
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
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
