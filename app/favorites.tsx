import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrekCard } from '../components/TrekCard';
import { colors } from '../constants/Colors';
import { useTrekStore } from '../store/trek-store';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteTreks, fetchFavorites } = useTrekStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {favoriteTreks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No favorite treks yet</Text>
          </View>
        ) : (
          favoriteTreks.map((trek) => (
            <TrekCard
              key={trek.id}
              trek={trek}
              showFavorite={true}
              useStore={true}
            />
          ))
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
