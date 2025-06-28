import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../constants/Colors';
import { useTrekStore } from '../store/trek-store';
import { useTrekDetailStore } from '../store/trek-store-single';

const { width } = Dimensions.get('window');

interface Trek {
  id: number;
  name: string;
  district: string;
  region: string;
  difficulty: string;
  duration: string;
  photos: string[];
  elevation_profile: {
    max_elevation: string;
    min_elevation: string;
  };
}

interface TrekCardProps {
  trek: Trek;
  compact?: boolean;
  showFavorite?: boolean;
  useStore?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TrekCard: React.FC<TrekCardProps> = ({ 
  trek, 
  compact = false, 
  showFavorite = false,
  useStore = false,
  style 
}) => {
  const router = useRouter();
  
  // Store methods (only used when useStore is true)
  const { toggleFavorite, isFavorite } = useTrekStore();
  const { fetchTrekById } = useTrekDetailStore();

  const handlePress = () => {
    if (useStore) {
      fetchTrekById(trek.id);
    }
    router.push(`/trek/${trek.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (useStore) {
      toggleFavorite(trek.id);
    }
  };

  const isCurrentTrekFavorite = useStore ? isFavorite(trek.id) : false;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return colors.difficulty?.easy || '#4CAF50';
      case 'moderate':
        return colors.difficulty?.moderate || '#FF9800';
      case 'challenging':
        return colors.difficulty?.challenging || '#F44336';
      case 'extreme':
        return colors.difficulty?.extreme || '#9C27B0';
      default:
        return colors.difficulty?.moderate || '#FF9800';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: trek.photos[0] }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        {showFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Text style={styles.favoriteIcon}>
              {isCurrentTrekFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {trek.name}
          </Text>
          <View style={styles.compactLocation}>
            <Text style={styles.compactLocationText}>
              📍 {trek.district}, {trek.region}
            </Text>
          </View>
          <View style={styles.compactDetails}>
            <View
              style={[
                styles.compactDifficulty,
                { backgroundColor: getDifficultyColor(trek.difficulty) },
              ]}
            >
              <Text style={styles.compactDifficultyText}>
                {trek.difficulty}
              </Text>
            </View>
            <Text style={styles.compactDuration}>⏱️ {trek.duration}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: trek.photos[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(trek.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{trek.difficulty}</Text>
          </View>
          {showFavorite && (
            <TouchableOpacity
              style={styles.favoriteButtonRegular}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Text style={styles.favoriteIcon}>
                {isCurrentTrekFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {trek.name}
        </Text>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location} numberOfLines={1}>
            {trek.district}, {trek.region}
          </Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <Text style={styles.detailText}>{trek.duration}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🏔️</Text>
            <Text style={styles.detailText}>
              {trek.elevation_profile.max_elevation}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact card styles
  compactCard: {
    width: width * 0.7,
    backgroundColor: colors.card || '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text || '#000000',
    marginBottom: 8,
  },
  compactLocation: {
    marginBottom: 8,
  },
  compactLocationText: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
  },
  compactDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  compactDifficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  compactDuration: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
  },

  // Favorite button styles
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButtonRegular: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 16,
  },

  // Regular card styles
  card: {
    backgroundColor: colors.card || '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text || '#000000',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
  },
});