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

interface TrekDetailStore {
  currentTrek: Trek | null;
  favoriteIds: Set<number>;
  loading: boolean;
  error: string | null;
  fetchTrekById: (id: number) => Promise<void>;
  clearCurrentTrek: () => void;
  toggleFavorite: (trekId: number) => void;
  isFavorite: (trekId: number) => boolean;
}

export const useTrekDetailStore = create<TrekDetailStore>((set, get) => ({
  currentTrek: null,
  favoriteIds: new Set<number>(),
  loading: false,
  error: null,

  fetchTrekById: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`http://192.168.0.101:8000/api/treks/${id}/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Trek = await response.json();
      
      set({
        currentTrek: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching trek details:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trek details',
        loading: false,
        currentTrek: null,
      });
    }
  },

  clearCurrentTrek: () => {
    set({
      currentTrek: null,
      loading: false,
      error: null,
    });
  },

  toggleFavorite: (trekId: number) => {
    const state = get();
    const newFavoriteIds = new Set(state.favoriteIds);
    
    if (newFavoriteIds.has(trekId)) {
      newFavoriteIds.delete(trekId);
    } else {
      newFavoriteIds.add(trekId);
    }
    
    set({ favoriteIds: newFavoriteIds });
  },

  isFavorite: (trekId: number) => {
    const state = get();
    return state.favoriteIds.has(trekId);
  },
}));