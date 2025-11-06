interface ContactService {
  name: string;
  email: string;
  phone?: string; // Made optional to handle cases where phone might not be available
  type: string;
  fallback: boolean;
}

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number | null;
  distance_km: number;
  latitude: number;
  longitude: number;
  phone?: string; // Made optional as phone numbers might not always be available
  website: string;
  email: string;
  address: string;
  type: string;
}

export interface SOSAlert {
  id: number;
  latitude: number;
  longitude: number;
  description?: string;
  emergency_type?: string | string[];
  selected_types: string[];
  contacted_services: ContactService[];
  google_places_data: GooglePlace[];
  fallback_contacts: ContactService[];
  status: 'sent' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at: string | null;
}
