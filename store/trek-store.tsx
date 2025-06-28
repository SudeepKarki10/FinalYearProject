import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

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

interface TrekStore {
  treks: Trek[];
  recommendedTreks: Trek[];
  favoriteIds: Set<number>;
  favoriteTreks: Trek[];
  error: string | null;
  loading: boolean;
  fetchTreks: () => Promise<void>;
  fetchRecommendedTreks: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (trekId: number) => Promise<void>;
  isFavorite: (trekId: number) => boolean;
  getFavoriteCount: () => number;
  getRecommendedTreks: () => Trek[];
}

const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const useTrekStore = create<TrekStore>((set, get) => ({
  treks: [],
  recommendedTreks: [],
  favoriteIds: new Set<number>(),
  favoriteTreks: [],
  error: null,
  loading: false,

  fetchTreks: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`http://192.168.0.101:8000/api/treks/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Trek[] = await response.json();
      set({ treks: data, loading: false });
    } catch (error) {
      console.error('Error fetching treks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch treks',
        loading: false 
      });
    }
  },

  fetchRecommendedTreks: async () => {
    try {
      // Use regular treks endpoint if recommended endpoint isn't available
      const headers = await getAuthHeaders();
      const response = await fetch(`http://192.168.0.101:8000/api/recommendations/`, {
        headers
      });
      
      console.log('Fetching recommended treks :', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Trek[] = await response.json();
      
      // Take the first 3 treks as recommended (or slice if less than 3)
      const recommendations = data;
      set({ recommendedTreks: recommendations });
    } catch (error) {
      console.error('Error fetching recommended treks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch recommended treks',
        recommendedTreks: [] // Reset recommendations on error
      });
    }
  },

  fetchFavorites: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://192.168.0.101:8000/api/favorites/`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched favorites data:', data);
      const favoriteIds = new Set<number>(data.map((fav: { trek: number }) => fav.trek));
      const favoriteTreks = data;
      console.log('Mapped favorite trek IDs:', Array.from(favoriteIds));
      set({ favoriteIds, favoriteTreks });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch favorites' });
    }
  },

  toggleFavorite: async (trekId: number) => {
    try {
      const headers = await getAuthHeaders();
      const isFavorited = get().favoriteIds.has(trekId);
      
      // Get user from auth store
      const authStore = (await import('./auth-store')).useAuthStore.getState();
      const user = authStore.user;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const userId = user.user?.id || user.id;

      let response;
      if (isFavorited) {
        console.log('Attempting to remove favorite for trek:', trekId);
        // First get the favorite ID
        const favResponse = await fetch(`http://192.168.0.101:8000/api/favorites/`, {
          headers
        });
        
        if (!favResponse.ok) {
          throw new Error(`HTTP error! status: ${favResponse.status}`);
        }
        
        const favorites = await favResponse.json();
        console.log('All favorites:', favorites);
        
        const favorite = favorites.find(
          (f: { trek: number; id: number }) => f.trek === trekId
        );
        
        if (!favorite) {
          console.log('No favorite found for trek:', trekId);
          throw new Error('Favorite not found');
        }

        console.log('Favorite found:', favorite.id, 'for trek:', favorite.trek);
        
        if (!favorite) {
          throw new Error('Favorite not found');
        }

        // DELETE request with the favorite ID
        response = await fetch(`http://192.168.0.101:8000/api/favorites/${favorite.id}/`, {
          method: 'DELETE',
          headers
        });
      } else {
        // POST request
        response = await fetch(`http://192.168.0.101:8000/api/favorites/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user: userId,
            trek: trekId
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state optimistically
      const favoriteIds = new Set(get().favoriteIds);
      if (isFavorited) {
        favoriteIds.delete(trekId);
      } else {
        favoriteIds.add(trekId);
      }

      // Update favorite treks array
      const favoriteTreks = isFavorited
        ? get().favoriteTreks.filter(trek => trek.id !== trekId)
        : [...get().favoriteTreks, get().treks.find(trek => trek.id === trekId)!];

      set({ favoriteIds, favoriteTreks });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to toggle favorite' });
    }
  },

  isFavorite: (trekId: number) => {
    console.log('Checking if trek is favorite:', trekId, 'Current favoriteIds:', Array.from(get().favoriteIds));
    return get().favoriteIds.has(trekId);
  },

  getFavoriteCount: () => {
    return get().favoriteIds.size;
  },

  getRecommendedTreks: () => {
    return get().recommendedTreks;
  },
}))