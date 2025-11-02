import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { TimsPass } from '../types/tims';
import { useAuthStore } from './auth-store';

interface VerificationDetails {
  verified_by: string;
  officer_role: string;
  verification_time: string;
}

interface QRVerificationResult {
  success: boolean;
  verified?: boolean;
  verification_details?: VerificationDetails;
  permit_details?: TimsPass;
  error?: string;
  user_role?: string;
}

interface AdminState {
  isLoading: boolean;
  error: string | null;
  adminPasses: TimsPass[];
  qrVerificationResult: QRVerificationResult | null;
  
  // Actions
  fetchAllTimsPasses: () => Promise<void>;
  updatePassStatus: (passId: number, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  verifyQRCode: (qrData: string) => Promise<QRVerificationResult | null>;
  clearVerificationResult: () => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isLoading: false,
  error: null,
  adminPasses: [],
  qrVerificationResult: null,

  fetchAllTimsPasses: async () => {
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
      
      set({ adminPasses: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch TIMS passes', isLoading: false });
    }
  },

  updatePassStatus: async (passId: number, status: 'pending' | 'approved' | 'rejected') => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Authentication required' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}tims/${passId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pass status');
      }

      // Update the pass in the local state
      set((state) => ({
        adminPasses: state.adminPasses.map((pass) =>
          pass.id === passId ? { ...pass, status } : pass
        ),
        isLoading: false,
      }));

      // Also update in verification result if present
      set((state) => {
        if (state.qrVerificationResult?.permit_details?.id === passId) {
          return {
            qrVerificationResult: {
              ...state.qrVerificationResult,
              permit_details: {
                ...state.qrVerificationResult.permit_details,
                status,
              },
            },
          };
        }
        return state;
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update pass status', isLoading: false });
      throw err;
    }
  },

  verifyQRCode: async (qrData: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Authentication required' });
      return null;
    }

    set({ isLoading: true, error: null, qrVerificationResult: null });
    try {
      const response = await fetch(`${API_BASE_URL}verify/verify_qr/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qr_data: qrData }),
      });

      const raw = await response.json();
      
      if (!response.ok) {
        const result: QRVerificationResult = {
          success: false,
          error: raw.error || 'QR verification failed',
          user_role: raw.user_role,
        };
        set({ qrVerificationResult: result, isLoading: false });
        return result;
      }

      const result: QRVerificationResult = {
        success: raw.success,
        verified: raw.verified,
        verification_details: raw.verification_details,
        permit_details: raw.permit_details,
      };

      set({ qrVerificationResult: result, isLoading: false });
      return result;
    } catch (err) {
      const result: QRVerificationResult = {
        success: false,
        error: err instanceof Error ? err.message : 'QR verification failed',
      };
      set({ qrVerificationResult: result, isLoading: false });
      return result;
    }
  },

  clearVerificationResult: () => {
    set({ qrVerificationResult: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));