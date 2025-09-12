import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { TimsPass } from '../types/tims';
import { useAuthStore } from './auth-store';

interface TimsState {
  isLoading: boolean;
  error: string | null;
  passes: TimsPass[];
  currentPass: TimsPass | null;
  fetchPasses: () => Promise<void>;
  fetchPassDetails: (id: number) => Promise<void>;
  createTimsApplication: (payload: CreateTimsPayload) => Promise<TimsPass | null>;
}

// Request payload for creating a TIMS application (aligned with API spec)
export interface CreateTimsPayload {
  trek_id: number;
  transaction_id: string;
  image: string;
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: string; // YYYY-MM-DD
  trekker_area: string;
  route: string;
  entry_date: string; // YYYY-MM-DD
  exit_date: string; // YYYY-MM-DD
  nepal_contact_name: string;
  nepal_organization: string;
  nepal_designation: string;
  nepal_mobile: string;
  nepal_office_number: string;
  nepal_address: string;
  home_contact_name: string;
  home_city: string;
  home_mobile: string;
  home_office_number: string;
  home_address: string;
  transit_pass_cost: number;
  permit_cost: number;
}

export const useTimsStore = create<TimsState>((set) => ({
  isLoading: false,
  error: null,
  passes: [],
  currentPass: null,

  fetchPasses: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Authentication required' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}tims/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TIMS passes');
      }

  const raw = await response.json();
  const data = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw;
  set({ passes: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch TIMS passes', isLoading: false });
    }
  },

  fetchPassDetails: async (id: number) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Authentication required' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}tims/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TIMS pass details');
      }

  const raw = await response.json();
  const data = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw;
  set({ currentPass: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch TIMS pass details', isLoading: false });
    }
  },

  createTimsApplication: async (payload: CreateTimsPayload) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Authentication required' });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}tims/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.json();
      if (!response.ok) {
        const message = (raw && raw.message) || (raw && raw.error) || 'Failed to create TIMS application';
        throw new Error(message);
      }

      // Unwrap common API shape { success, message, data }
      const created: TimsPass = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw;

      set((prev) => ({
        passes: [created, ...prev.passes],
        currentPass: created,
        isLoading: false,
      }));

      return created;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create TIMS application', isLoading: false });
      return null;
    }
  },
}));
