import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/Colors";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Treks</Text>
      </View>

      <View style={styles.trekList}>
        <View style={styles.trekCard}>
          <Text style={styles.trekName}>Everest Base Camp</Text>
          <Text style={styles.trekLocation}>Solukhumbu, Nepal</Text>
          <Text style={styles.trekDifficulty}>Difficulty: Challenging</Text>
          <Text style={styles.trekDuration}>Duration: 12 days</Text>
        </View>

        <View style={styles.trekCard}>
          <Text style={styles.trekName}>Annapurna Circuit</Text>
          <Text style={styles.trekLocation}>Gandaki, Nepal</Text>
          <Text style={styles.trekDifficulty}>Difficulty: Moderate</Text>
          <Text style={styles.trekDuration}>Duration: 15 days</Text>
        </View>

        <View style={styles.trekCard}>
          <Text style={styles.trekName}>Langtang Valley</Text>
          <Text style={styles.trekLocation}>Bagmati, Nepal</Text>
          <Text style={styles.trekDifficulty}>Difficulty: Easy</Text>
          <Text style={styles.trekDuration}>Duration: 7 days</Text>
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
  trekList: {
    padding: 16,
  },
  trekCard: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trekName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  trekLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  trekDifficulty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  trekDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
