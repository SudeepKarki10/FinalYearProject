import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/Colors";

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trek Maps</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Image
          source={require("../../assets/images/map-placeholder.png")}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <Text style={styles.mapLabel}>Map View</Text>
      </View>

      <View style={styles.trekList}>
        <Text style={styles.sectionTitle}>Popular Treks</Text>
        
        <View style={styles.trekItem}>
          <Text style={styles.trekName}>Everest Base Camp</Text>
          <Text style={styles.trekLocation}>Solukhumbu, Nepal</Text>
        </View>

        <View style={styles.trekItem}>
          <Text style={styles.trekName}>Annapurna Circuit</Text>
          <Text style={styles.trekLocation}>Gandaki, Nepal</Text>
        </View>

        <View style={styles.trekItem}>
          <Text style={styles.trekName}>Langtang Valley</Text>
          <Text style={styles.trekLocation}>Bagmati, Nepal</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  mapPlaceholder: {
    height: 200,
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapLabel: {
    position: "absolute",
    color: colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  trekList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  trekItem: {
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  trekName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  trekLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
