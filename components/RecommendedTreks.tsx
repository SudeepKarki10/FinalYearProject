import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Trek } from '../types';
import { ThemedText } from './ThemedText';
import { TrekCard } from './TrekCard';

interface RecommendedTreksProps {
  treks: Trek[];
}

export const RecommendedTreks: React.FC<RecommendedTreksProps> = ({ treks }) => {
  if (!treks || treks.length === 0) return null;

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Recommended for You</ThemedText>
      <FlatList
        horizontal
        data={treks}
        renderItem={({ item }) => (
          <TrekCard
            trek={item}
            style={styles.trekCard}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.treksList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
