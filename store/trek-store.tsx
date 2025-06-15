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
  featuredTreks: Trek[];
  popularTreks: Trek[];
  loading: boolean;
  error: string | null;
  fetchTreks: () => Promise<void>;
  getFeaturedTreks: () => Trek[];
  getPopularTreks: () => Trek[];
}

export const useTrekStore = create<TrekStore>((set, get) => ({
  treks: [],
  featuredTreks: [],
  popularTreks: [],
  loading: false,
  error: null,

  fetchTreks: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('https://treknepal.onrender.com/api/treks/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Trek[] = await response.json();
      
      // Get first 5 treks for featured section
      const featured = data.slice(0, 5);
      
      // Get next 5 treks for popular section (or first 5 if less than 10 total)
      const popular = data.length > 5 ? data.slice(5, 10) : data.slice(0, 5);
      
      set({
        treks: data,
        featuredTreks: featured,
        popularTreks: popular,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching treks:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch treks',
        loading: false,
      });
    }
  },

  getFeaturedTreks: () => {
    const state = get();
    return state.featuredTreks;
  },

  getPopularTreks: () => {
    const state = get();
    return state.popularTreks;
  },
}));