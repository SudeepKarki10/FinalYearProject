import { ThemedText } from '@/components/ThemedText';
import { useTrekStore } from '@/store/trek-store';
import { useTrekDetailStore } from '@/store/trek-store-single';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Helper function for difficulty badge colors
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return { backgroundColor: '#4CAF50' };
    case 'moderate':
      return { backgroundColor: '#FF9800' };
    case 'challenging':
    case 'difficult':
      return { backgroundColor: '#F44336' };
    default:
      return { backgroundColor: '#2196F3' };
  }
};

export default function TrekDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentTrek, loading, error, fetchTrekById, clearCurrentTrek } = useTrekDetailStore();
  const { toggleFavorite, isFavorite } = useTrekStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tabs = ['Overview', 'Itinerary', 'Costs', 'Gear'];

  useEffect(() => {
    if (id) {
      fetchTrekById(Number(id));
    }

    return () => {
      clearCurrentTrek();
    };
  }, [id, fetchTrekById, clearCurrentTrek]);

  const handleFavoritePress = async () => {
    if (currentTrek) {
      await toggleFavorite(currentTrek.id);
    }
  };

  const renderImageSlider = () => {
    if (!currentTrek?.photos?.length) return null;

    return (
      <View style={styles.imageSliderContainer}>
        <FlatList
          data={currentTrek.photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.headerImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.headerOverlay} />
        <TouchableOpacity 
          style={[
            styles.favoriteButton,
            isFavorite(currentTrek.id) && styles.favoriteButtonActive
          ]}
          onPress={handleFavoritePress}
        >
          <Ionicons 
            name={isFavorite(currentTrek.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite(currentTrek.id) ? "#FF4B4B" : "white"} 
          />
        </TouchableOpacity>
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {currentTrek.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { opacity: index === currentImageIndex ? 1 : 0.5 }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!currentTrek) return null;

    switch (activeTab) {
      case 'Overview':
        return (
          <View style={styles.tabContent}>
            <ThemedText style={styles.description}>
              {currentTrek.description}
            </ThemedText>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="triangle-outline" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <ThemedText style={styles.infoLabel}>Max Elevation</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {currentTrek.elevation_profile.max_elevation}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <ThemedText style={styles.infoLabel}>Duration</ThemedText>
                  <ThemedText style={styles.infoValue}>{currentTrek.duration}</ThemedText>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <ThemedText style={styles.infoLabel}>Best Seasons</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {currentTrek.best_seasons?.join(', ')}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <ThemedText style={styles.infoLabel}>Region</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {currentTrek.region}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );

      case 'Itinerary':
        return (
          <View style={styles.tabContent}>
            {currentTrek.itinerary.map((item, index) => (
              <View key={index} style={styles.itineraryListItem}>
                <View style={styles.dayDot}>
                  <ThemedText style={styles.dayNumber}>{index + 1}</ThemedText>
                </View>
                <ThemedText style={styles.itineraryText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        );

      case 'Costs':
        return (
          <View style={styles.tabContent}>
            {currentTrek.cost_breakdown && (
              <>
                <View style={styles.costItem}>
                  <ThemedText style={styles.costLabel}>Permits</ThemedText>
                  <ThemedText style={styles.costValue}>
                    {currentTrek.cost_breakdown.permits}
                  </ThemedText>
                </View>
                
                <View style={styles.costItem}>
                  <ThemedText style={styles.costLabel}>Guide</ThemedText>
                  <ThemedText style={styles.costValue}>
                    {currentTrek.cost_breakdown.guide}
                  </ThemedText>
                </View>
                
                <View style={styles.costItem}>
                  <ThemedText style={styles.costLabel}>Porter</ThemedText>
                  <ThemedText style={styles.costValue}>
                    {currentTrek.cost_breakdown.porter}
                  </ThemedText>
                </View>
                
                <View style={styles.costItem}>
                  <ThemedText style={styles.costLabel}>Accommodation</ThemedText>
                  <ThemedText style={styles.costValue}>
                    {currentTrek.cost_breakdown.accommodation}
                  </ThemedText>
                </View>
                
                <View style={styles.costItem}>
                  <ThemedText style={styles.costLabel}>Food</ThemedText>
                  <ThemedText style={styles.costValue}>
                    {currentTrek.cost_breakdown.food}
                  </ThemedText>
                </View>
              </>
            )}
            
            {currentTrek.transportation && (
              <View style={styles.costItem}>
                <ThemedText style={styles.costLabel}>Transportation</ThemedText>
                <ThemedText style={styles.costValue}>
                  {currentTrek.transportation}
                </ThemedText>
              </View>
            )}
          </View>
        );

      case 'Gear':
        return (
          <View style={styles.tabContent}>
            <ThemedText style={styles.gearTitle}>
              Essential gear for the {currentTrek.name}:
            </ThemedText>
            {currentTrek.recommended_gear?.map((item, index) => (
              <View key={index} style={styles.gearItem}>
                <View style={styles.gearDot} />
                <ThemedText style={styles.gearText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error || !currentTrek) {
    return (
      <View style={styles.centered}>
        <ThemedText>Error loading trek: {error}</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Trek Details' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Image Slider */}
        {renderImageSlider()}

        {/* Trek Info Header */}
        <View style={styles.headerInfo}>
          <ThemedText style={styles.trekTitle}>{currentTrek.name}</ThemedText>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <ThemedText style={styles.locationText}>
              {currentTrek.district}, {currentTrek.region}
            </ThemedText>
          </View>
          <View style={[styles.difficultyBadge, getDifficultyColor(currentTrek.difficulty)]}>
            <ThemedText style={styles.difficultyText}>{currentTrek.difficulty}</ThemedText>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}
                >
                  {tab}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imageSliderContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  headerInfo: {
    padding: 20,
    paddingBottom: 0,
  },
  trekTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itineraryListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  dayNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itineraryText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  costItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  gearTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
  gearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  gearDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
  },
  gearText: {
    fontSize: 16,
    color: '#333',
  },
});