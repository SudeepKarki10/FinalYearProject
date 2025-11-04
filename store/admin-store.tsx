import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { TimsPass } from '../types/tims';
import { useAuthStore } from './auth-store';

const normalizePassStatus = (status: unknown): 'pending' | 'approved' | 'rejected' => {
  if (typeof status !== 'string') {
    return 'pending';
  }

  const lowered = status.toLowerCase();
  if (lowered === 'approved' || lowered === 'rejected') {
    return lowered as 'approved' | 'rejected';
  }

  return 'pending';
};

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
      const targetStatus = normalizePassStatus(status);
      const response = await fetch(`${API_BASE_URL}tims/${passId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pass status');
      }

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      const dataPayload = (() => {
        if (!responseData || typeof responseData !== 'object') {
          return null;
        }

        const payload = 'data' in (responseData as Record<string, unknown>)
          ? (responseData as Record<string, unknown>).data
          : responseData;

        return payload && typeof payload === 'object' ? payload : null;
      })();

      const normalizedPayload: Partial<TimsPass> | null = (() => {
        if (!dataPayload) {
          return null;
        }

        const recordPayload = dataPayload as Record<string, unknown>;
        const draft: Partial<TimsPass> = { ...(recordPayload as Partial<TimsPass>) };

        if ('status' in recordPayload) {
          draft.status = normalizePassStatus(recordPayload.status);
        }

        return draft;
      })();

      const updatedStatus = normalizedPayload?.status ?? targetStatus;

      set((state) => {
        const updatedPasses = state.adminPasses.map((currentPass) =>
          currentPass.id === passId
            ? {
                ...currentPass,
                ...(normalizedPayload ?? {}),
                status: updatedStatus,
              }
            : currentPass
        );

        let nextVerificationResult = state.qrVerificationResult;
        if (
          nextVerificationResult?.permit_details &&
          nextVerificationResult.permit_details.id === passId
        ) {
          nextVerificationResult = {
            ...nextVerificationResult,
            permit_details: {
              ...nextVerificationResult.permit_details,
              ...(normalizedPayload ?? {}),
              status: updatedStatus,
            },
          };
        }

        return {
          adminPasses: updatedPasses,
          qrVerificationResult: nextVerificationResult,
          isLoading: false,
        };
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