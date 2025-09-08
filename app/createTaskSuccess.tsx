import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateTaskSuccessScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.replace("/(tabs)"); // Navigate to main tabs
  };

  const handleCreateAnother = () => {
    router.replace("/createTask"); // Navigate back to create task form
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "http://localhost:3845/assets/720c3511213977afb46de015fe6bc42e5adceb97.svg",
        }}
        style={styles.icon}
      />
      <Image
        source={{
          uri: "http://localhost:3845/assets/8064bb4d2fdd9c67cf9865dfecf4e7435fb8505a.svg",
        }}
        style={styles.icon2}
      />
      <Text style={styles.title}>Laporan Harian Berhasil Dikirim!</Text>
      <Text style={styles.subtitle}>
        Terima kasih telah melaporkan kegiatan harian, selamat melanjutkan
        aktivitas!
      </Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleBackToHome}
        >
          <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleCreateAnother}
        >
          <Text style={styles.secondaryButtonText}>Buat Laporan Lagi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    width: 58,
    height: 58,
    marginBottom: 8,
  },
  icon2: {
    width: 100,
    height: 86,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    paddingTop: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: "#1a365d",
    shadowColor: "#1a365d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1a365d",
    fontSize: 16,
    fontWeight: "600",
  },
});
