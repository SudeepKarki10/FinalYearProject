import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/Colors";
import { useTrekStore } from "../../store/trek-store";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteTreks, fetchFavorites, fetchTreks } = useTrekStore();

  useEffect(() => {
    // First fetch all treks, then fetch favorites
    const loadData = async () => {
      await fetchTreks();
      await fetchFavorites();
    };
    loadData();
  }, [fetchTreks, fetchFavorites]);

  const handleTrekPress = (trekId: number) => {
    router.push(`/trek/${trekId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Favorites</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {favoriteTreks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No favorite treks yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add treks to your favorites to see them here
            </Text>
          </View>
        ) : (
          <View style={styles.treksList}>
            {favoriteTreks.map((trek) => (
              <TouchableOpacity
                key={trek.id}
                style={styles.trekCard}
                onPress={() => handleTrekPress(trek.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: trek.photos[0] }}
                  style={styles.trekImage}
                />
                <View style={styles.trekInfo}>
                  <View style={styles.trekHeader}>
                    <Text style={styles.trekName}>{trek.name}</Text>
                    <View style={[
                      styles.difficultyBadge,
                      trek.difficulty.toLowerCase() === 'easy' 
                        ? styles.easyBadge 
                        : trek.difficulty.toLowerCase() === 'moderate'
                        ? styles.moderateBadge
                        : styles.challengingBadge
                    ]}>
                      <Text style={styles.difficultyText}>{trek.difficulty}</Text>
                    </View>
                  </View>
                  <View style={styles.trekDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{trek.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{trek.region}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  treksList: {
    gap: 16,
  },
  trekCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trekImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  trekInfo: {
    padding: 16,
  },
  trekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trekName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: '#4CAF50',
  },
  moderateBadge: {
    backgroundColor: '#FF9800',
  },
  challengingBadge: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  trekDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
