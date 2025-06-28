import { useCallback, useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { CategoryCard } from "../../components/CategoryCard";
import OnboardingForm from "../../components/OnboardingForm";
import { RecommendedTreks } from "../../components/RecommendedTreks";
import { SearchBar } from "../../components/SearchBar";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { TrekCard } from "../../components/TrekCard";
import { useAuthStore } from "../../store/auth-store";
import { useTrekStore } from "../../store/trek-store";
import { Trek } from "../../types";

export default function MainPage() {
  const { fetchTreks, treks, fetchRecommendedTreks, recommendedTreks } = useTrekStore();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  const renderTrekCard = useCallback(({ item }: { item: Trek }) => (
    <TrekCard trek={item} style={styles.trekCard} />
  ), []);

  useEffect(() => {
    fetchTreks();
    if (isAuthenticated) {
      fetchRecommendedTreks();
    }
  }, [fetchTreks, fetchRecommendedTreks, isAuthenticated]);

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <OnboardingForm />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.searchBar}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>
        
        {/* Categories Section */}
        <FlatList
          horizontal
          data={["Hiking", "Camping", "Cycling", "Climbing"]}
          renderItem={({ item }) => <CategoryCard category={item} />}
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />

        {/* Recommended Treks Section */}
        {isAuthenticated && <RecommendedTreks treks={recommendedTreks} />}

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
