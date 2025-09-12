import { API_BASE_URL } from "@/constants/config";
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
      const response = await fetch(`${API_BASE_URL}treks/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  const raw = await response.json();
  const data: Trek[] = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw;
  set({ treks: Array.isArray(data) ? data : [], loading: false });
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
      set({ loading: true, error: null });
      
      const authStore = (await import('./auth-store')).useAuthStore.getState();
      const interests = authStore.user?.interests;
      
      if (!interests || interests.length === 0) {
        console.log('No interests set; skipping fetchRecommendedTreks.');
        set({ loading: false });
        return;
      }

      console.log('Fetching recommendations with interests:', interests);
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}recommendations/treks/`, {
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Recommendations API error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Recommendations API response:', responseData);
      
      // Handle the response structure from the backend
      const recommendations = responseData.recommended_treks || [];
      
      console.log('Processed recommendations:', recommendations);
      
      set({ 
        recommendedTreks: recommendations, 
        error: null,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching recommended treks:', error);
      set((state) => ({ 
        error: error instanceof Error ? error.message : 'Failed to fetch recommended treks',
        recommendedTreks: state.recommendedTreks,
        loading: false
      }));
    }
  },

  fetchFavorites: async () => {
    try {
      // Get authentication headers for the logged-in user
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}favorites/`, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // This gets the favorites data: [{ id, trek, user }, ...]
      const favoritesData = await response.json();
      console.log('Fetched favorites data:', favoritesData);

      // Create a Set of trek IDs from the favorites data, handling both formats
      const favoriteIds = new Set<number>(
        Array.isArray(favoritesData) 
          ? favoritesData.map((fav: { trek: number | { id: number } }) => 
              typeof fav.trek === 'number' ? fav.trek : fav.trek.id)
          : favoritesData.data 
            ? favoritesData.data.map((fav: { trek: number | { id: number } }) => 
                typeof fav.trek === 'number' ? fav.trek : fav.trek.id)
            : []
      );
      console.log('Mapped favorite trek IDs:', Array.from(favoriteIds));

      // Get the full list of all treks from the store's state
      const allTreks = get().treks;
      
      // If treks haven't been fetched yet, fetch them first
      if (allTreks.length === 0) {
        console.log('Fetching treks before mapping favorites...');
        await get().fetchTreks();
      }

      // Filter the full list of treks to get only the favorited ones
      const favoriteTreks = get().treks.filter(trek => favoriteIds.has(trek.id));
      console.log('Mapped favorite treks:', favoriteTreks);
      
      // Set both the IDs and the full trek objects
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
console.log("header is :", headers);
      let response;
      if (isFavorited) {
        console.log('Attempting to remove favorite for trek:', trekId);
        // First get the favorite ID
        const favResponse = await fetch(`${API_BASE_URL}favorites/`, {
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
        response = await fetch(`${API_BASE_URL}favorites/${favorite.id}/`, {
          method: 'DELETE',
          headers
        });
      } else {
        // POST request
        response = await fetch(`${API_BASE_URL}favorites/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            trek_id: trekId
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