export type TrekDifficulty =
  | "Easy"
  | "Moderate"
  | "Challenging"
  | "Extreme"
  | "Easy to Moderate"
  | "Moderate to Challenging"
  | "Strenuous";

export interface ElevationProfile {
  max_elevation: string;
  min_elevation: string;
}

export interface CostBreakdown {
  permits: string;
  guide: string;
  porter: string;
  accommodation: string;
  food: string;
}

export interface SafetyInfo {
  altitude_sickness_risk: string;
  [key: string]: string;
}

export interface ItineraryPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface Trek {
  id: number;
  name: string;
  district: string;
  region: string;
  difficulty: TrekDifficulty;
  duration: string;
  best_seasons: string[];
  elevation_profile: ElevationProfile;
  description: string;
  historical_significance: string;
  itinerary: string[];
  itinerary_points: ItineraryPoint[];
  cost_breakdown: CostBreakdown;
  transportation: string;
  nearby_attractions: string[];
  required_permits: string[];
  recommended_gear: string[];
  safety_info: SafetyInfo;
  transit_card_cost: number;
  photos: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
