import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TrekCard } from "../../components/TrekCard";
import { colors } from "../../constants/Colors";
import { useTrekStore } from "../../store/trek-store";
import type { Trek } from "../../types";

export default function HomeScreen() {
  const { 
    featuredTreks, 
    popularTreks, 
    loading, 
    error, 
    fetchTreks 
  } = useTrekStore();

  useEffect(() => {
    fetchTreks();
  }, [fetchTreks]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Nepal Trek Explorer</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>
              Search treks, districts, or attractions...
            </Text>
          </View>
        </View>

        {/* Featured Treks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Treks</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {featuredTreks.map((trek: Trek) => (
                <TrekCard
                  key={trek.id}
                  trek={trek}
                  compact={true}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Explore by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore by Category</Text>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: '#e1f5fe' }]}>
                <Text style={styles.categoryIconText}>🏔️</Text>
              </View>
              <Text style={styles.categoryName}>Treks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: '#fff3e0' }]}>
                <Text style={styles.categoryIconText}>🗺️</Text>
              </View>
              <Text style={styles.categoryName}>Districts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: '#e8f5e9' }]}>
                <Text style={styles.categoryIconText}>🏞️</Text>
              </View>
              <Text style={styles.categoryName}>Attractions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Treks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Treks</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.popularContainer}>
              {popularTreks.map((trek: Trek) => (
                <View key={trek.id} style={styles.popularCard}>
                  <TrekCard trek={trek} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
    color: colors.textSecondary,
  },
  searchPlaceholder: {
    color: colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  featuredContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    gap: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 14,
    color: colors.text,
  },
  popularContainer: {
    gap: 12,
  },
  popularCard: {
    marginBottom: 12,
  },
});
