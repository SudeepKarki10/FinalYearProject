import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/Colors";
import { useTrekStore } from "../../store/trek-store";
import { useTrekDetailStore } from "../../store/trek-store-single";

interface Trek {
  id: number;
  name: string;
  district: string;
  region: string;
  difficulty: string;
  duration: string;
  best_seasons: string[];
  elevation_profile: {
    max_elevation: string;
    min_elevation: string;
  };
  description: string;
  historical_significance: string;
  itinerary: string[];
  cost_breakdown: {
    permits: string;
    guide: string;
    porter: string;
    accommodation: string;
    food: string;
  };
  transportation: string;
  nearby_attractions: string[];
  required_permits: string[];
  recommended_gear: string[];
  safety_info: {
    altitude_sickness_risk: string;
  };
  photos: string[];
  itinerary_points: {
    name: string;
    lat: number;
    lng: number;
  }[];
}

const { width } = Dimensions.get("window");

export default function TrekDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentTrek, loading, error, fetchTrekById } = useTrekDetailStore();
  const { toggleFavorite, isFavorite } = useTrekStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTrekById(Number(id));
    }
  }, [id, fetchTrekById]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const handleToggleFavorite = () => {
    if (!currentTrek) return;
    toggleFavorite(currentTrek.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#4CAF50";
      case "moderate":
        return "#FF9800";
      case "challenging":
        return "#F44336";
      case "extreme":
        return "#9C27B0";
      default:
        return "#FF9800";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading trek details...</Text>
      </View>
    );
  }

  if (error || !currentTrek) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "Trek not found"}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => id && fetchTrekById(Number(id))}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCurrentTrekFavorite = isFavorite(currentTrek.id);


  const renderTabContent = () => {
    if (!currentTrek) return null;

    switch (activeTab) {
      case "overview":
        return (
          <View>
            <Text style={styles.description}>{currentTrek.description}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🏔️</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Max Elevation</Text>
                    <Text style={styles.infoValue}>
                      {currentTrek.elevation_profile.max_elevation}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={styles.infoValue}>{currentTrek.duration}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Best Seasons</Text>
                    <Text style={styles.infoValue}>
                      {currentTrek.best_seasons.join(", ")}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Region</Text>
                    <Text style={styles.infoValue}>{currentTrek.region}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historical Significance</Text>
              <Text style={styles.sectionText}>
                {currentTrek.historical_significance}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Attractions</Text>
              <View style={styles.tagContainer}>
                {currentTrek.nearby_attractions.map((attraction, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{attraction}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Information</Text>
              <View style={styles.safetyContainer}>
                <Text style={styles.safetyIcon}>⚠️</Text>
                <Text style={styles.safetyText}>
                  Altitude Sickness Risk:{" "}
                  {currentTrek.safety_info.altitude_sickness_risk}
                </Text>
              </View>
            </View>
          </View>
        );

      case "itinerary":
        return (
          <View style={styles.itineraryContainer}>
            {currentTrek.itinerary.map((day, index) => (
              <View key={index} style={styles.itineraryItem}>
                <View style={styles.itineraryDot} />
                <View style={styles.itineraryContent}>
                  <Text style={styles.itineraryDay}>{day}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case "costs":
        return (
          <View>
            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Permits</Text>
              <Text style={styles.costText}>{currentTrek.cost_breakdown.permits}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Guide</Text>
              <Text style={styles.costText}>{currentTrek.cost_breakdown.guide}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Porter</Text>
              <Text style={styles.costText}>{currentTrek.cost_breakdown.porter}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Accommodation</Text>
              <Text style={styles.costText}>
                {currentTrek.cost_breakdown.accommodation}
              </Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Food</Text>
              <Text style={styles.costText}>{currentTrek.cost_breakdown.food}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Transportation</Text>
              <Text style={styles.costText}>{currentTrek.transportation}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Permits</Text>
              <View style={styles.tagContainer}>
                {currentTrek.required_permits.map((permit, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{permit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case "gear":
        return (
          <View>
            <Text style={styles.gearIntro}>
              Essential gear for the {currentTrek.name}:
            </Text>
            <View style={styles.gearList}>
              {currentTrek.recommended_gear.map((gear, index) => (
                <View key={index} style={styles.gearItem}>
                  <View style={styles.gearDot} />
                  <Text style={styles.gearText}>{gear}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading trek details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentTrek) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trek not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveImageIndex(newIndex);
          }}
        >
          {currentTrek.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.imagePagination}>
          {currentTrek.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>
            {isCurrentTrekFavorite ? "❤️" : "🤍"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentTrek.name}</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>
              {currentTrek.district}, {currentTrek.region}
            </Text>
          </View>

          <View style={styles.difficultyContainer}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(currentTrek.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{currentTrek.difficulty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "itinerary" && styles.activeTab]}
            onPress={() => setActiveTab("itinerary")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "itinerary" && styles.activeTabText,
              ]}
            >
              Itinerary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "costs" && styles.activeTab]}
            onPress={() => setActiveTab("costs")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "costs" && styles.activeTabText,
              ]}
            >
              Costs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "gear" && styles.activeTab]}
            onPress={() => setActiveTab("gear")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "gear" && styles.activeTabText,
              ]}
            >
              Gear
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text || '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: colors.text || '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary || '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width,
    height: 300,
  },
  imagePagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.white || '#FFFFFF',
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text || '#000000',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
    marginLeft: 4,
  },
//   
  difficultyContainer: {
    flexDirection: "row",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
  safetyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}20`,
    borderRadius: 8,
    padding: 12,
  },
  safetyText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  itineraryContainer: {
    marginTop: 8,
  },
  itineraryItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  itineraryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: 12,
  },
  itineraryContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  itineraryDay: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  costSection: {
    marginBottom: 16,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  costText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  gearIntro: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  gearList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  gearItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gearDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  gearText: {
    fontSize: 14,
    color: colors.text,
  },
  timsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20, // Add some space above the button
    marginBottom: 10,
  },
  timsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  safetyIcon: {
    fontSize: 20,
  },
  locationIcon: {
    fontSize: 16,
  },
});
