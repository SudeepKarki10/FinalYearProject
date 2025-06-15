export interface Trek {
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
