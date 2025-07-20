import { create } from 'zustand';
import { TimsPass } from '../types/tims';
import { useAuthStore } from './auth-store';

const API_BASE_URL = "http://192.168.18.4:8000/api/";

interface TimsState {
  isLoading: boolean;
  error: string | null;
  passes: TimsPass[];
  currentPass: TimsPass | null;
  fetchPasses: () => Promise<void>;
  fetchPassDetails: (id: number) => Promise<void>;
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

      const data = await response.json();
      set({ passes: data, isLoading: false });
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

      const data = await response.json();
      set({ currentPass: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch TIMS pass details', isLoading: false });
    }
  },
}));
