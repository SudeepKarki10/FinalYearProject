import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTrekStore } from '../store/trek-store';
import { useTrekDetailStore } from '../store/trek-store-single';
import { TrekCard } from './TrekCard';

export const TrekCardExample: React.FC = () => {
  const { treks, loading, error, fetchTreks } = useTrekStore();
  const { 
    currentTrek, 
    loading: detailLoading, 
    error: detailError
  } = useTrekDetailStore();

  useEffect(() => {
    fetchTreks();
  }, [fetchTreks]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading treks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trek Cards with Store Integration</Text>
      
      {treks.slice(0, 3).map((trek) => (
        <TrekCard
          key={trek.id}
          trek={trek}
          showFavorite={true}
          useStore={true}
        />
      ))}

      {currentTrek && (
        <View style={styles.currentTrekInfo}>
          <Text style={styles.currentTrekTitle}>Current Trek:</Text>
          <Text>{currentTrek.name}</Text>
          {detailLoading && <ActivityIndicator size="small" />}
          {detailError && <Text style={styles.error}>Error: {detailError}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  currentTrekInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTrekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
