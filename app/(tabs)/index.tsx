import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import OnboardingForm from "../../components/OnboardingForm";
import { RecommendedTreks } from "../../components/RecommendedTreks";
import { ThemedText } from "../../components/ThemedText";
import { TrekCard } from "../../components/TrekCard";
import { useAuthStore } from "../../store/auth-store";
import { useTrekStore } from "../../store/trek-store";
import { Trek } from "../../types";
import { Category } from "../../types/trek";

export default function MainPage() {
  const { fetchTreks, treks, fetchRecommendedTreks, recommendedTreks } = useTrekStore();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const categories: Category[] = [
    { id: 'hiking', name: 'Hiking', icon: 'Mountain', color: '#4F46E5' },
    { id: 'camping', name: 'Camping', icon: 'Map', color: '#16A34A' },
    { id: 'cycling', name: 'Cycling', icon: 'User', color: '#DC2626' },
    { id: 'climbing', name: 'Climbing', icon: 'Camera', color: '#F59E0B' },
  ];
  
  const renderTrekCard = useCallback(({ item }: { item: Trek }) => (
    <TrekCard trek={item} style={styles.trekCard} />
  ), []);

  useEffect(() => {
    fetchTreks();
    // Try to fetch recommendations when authenticated and onboarding is complete
    if (isAuthenticated && hasCompletedOnboarding) {
      console.log('Home: Fetching recommendations for authenticated user');
      fetchRecommendedTreks();
    }
  }, [fetchTreks, fetchRecommendedTreks, isAuthenticated, hasCompletedOnboarding]);

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <OnboardingForm />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* <View style={styles.searchBar}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View> */}
        
        {/* Categories Section */}
        {/* <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => <CategoryCard category={item} />}
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        /> */}

        {/* Recommended Treks Section (shows if any exist) */}
        {isAuthenticated && recommendedTreks?.length > 0 && (
          <RecommendedTreks treks={recommendedTreks} />
        )}

        {/* Featured Treks Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Featured Treks</ThemedText>
          <FlatList
            horizontal
            data={treks}
            renderItem={renderTrekCard}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treksList}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  categoriesList: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  treksList: {
    paddingHorizontal: 16,
  },
  trekCard: {
    marginRight: 16,
  },
});
