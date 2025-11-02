import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import OnboardingForm from "../../components/OnboardingForm";
import { RecommendedTreks } from "../../components/RecommendedTreks";
import { ThemedText } from "../../components/ThemedText";
import { TrekCard } from "../../components/TrekCard";
import { isAdminRole, useAuthStore } from "../../store/auth-store";
import { useTrekStore } from "../../store/trek-store";
import { Trek } from "../../types";

export default function MainPage() {
  const { fetchTreks, treks, fetchRecommendedTreks, recommendedTreks } = useTrekStore();
  const { isAuthenticated, hasCompletedOnboarding, user } = useAuthStore();
  const router = useRouter();
  
  const renderTrekCard = useCallback(({ item }: { item: Trek }) => (
    <TrekCard trek={item} style={styles.trekCard} />
  ), []);

  useEffect(() => {
    if (isAdminRole(user?.role)) {
      router.replace('/admin');
    }
  }, [user?.role, router]);

  useEffect(() => {
    if (isAdminRole(user?.role)) {
      return;
    }

    fetchTreks();
    // Try to fetch recommendations when authenticated and onboarding is complete
    if (isAuthenticated && hasCompletedOnboarding) {
      console.log('Home: Fetching recommendations for authenticated user');
      fetchRecommendedTreks();
    }
  }, [fetchTreks, fetchRecommendedTreks, isAuthenticated, hasCompletedOnboarding, user?.role]);

  if (isAdminRole(user?.role)) {
    return null;
  }

  if (isAuthenticated && !isAdminRole(user?.role) && !hasCompletedOnboarding) {
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
