import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function CreateTaskSuccessScreen() {
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
  },
});
