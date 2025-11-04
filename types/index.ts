export interface Trek {
  id: number;
  name: string;
  district: string;
  region: string;
  difficulty: string;
  duration: string;
  description?: string;
  photos: string[];
  best_seasons?: string[];
  itinerary?: string[];
  recommended_gear?: string[];
  transportation?: string;
  elevation_profile: {
    max_elevation: string;
    min_elevation: string;
  };
  cost_breakdown?: {
    permits: string;
    guide: string;
    porter: string;
    accommodation: string;
    food: string;
  };
  itinerary_points?: {
    lat: number;
    lng: number;
    name?: string;
    day?: number;
  }[];
}
