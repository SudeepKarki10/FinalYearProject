import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_BASE_URL } from "../constants/config";

export type UserInterests = string[];

interface User {
  id: number;  
  username: string;
  email: string;
  display_name: string;
  photo_url?: string | null;
  interests?: UserInterests;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  hasCompletedOnboarding: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, display_name: string, photo_url: string | null) => Promise<void>;
  changePassword: (old_password: string, new_password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  setNewPassword: (otp: string, new_password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  initAuth: () => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
  updateUserInterests: (interests: UserInterests) => Promise<boolean | void>;
  // Mark onboarding complete locally without network calls
  completeOnboardingLocally: () => void;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      successMessage: null,
      hasCompletedOnboarding: false,

  login: async (username, password) => {
  set({ isLoading: true, error: null, successMessage: null });
  
  try {
  const response = await fetch(`${API_BASE_URL}auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

  const ct = response.headers.get('content-type') || '';
  const rawText = await response.text();
  const data = ct.includes('application/json') ? JSON.parse(rawText) : { raw: rawText } as any;
  // Don't log response data to avoid showing sensitive info in console
  // console.log('Login response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Extract and transform nested user data
    const payload: any = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    const { token, user: responseUser } = payload;
    const inner = responseUser?.user || responseUser; // support both nested and flat shapes
    const user: User = {
      id: inner.id,
      username: inner.username,
      email: inner.email,
      display_name: responseUser.display_name ?? inner.display_name ?? inner.username,
      photo_url: responseUser.photo_url || null,
      user: {
        id: inner.id,
        username: inner.username,
        email: inner.email,
      },
      interests: responseUser.profile?.interests || [],
    };

    await AsyncStorage.setItem('auth_token', token);

    // Always require onboarding after each successful login
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      successMessage: "Login successful!",
      hasCompletedOnboarding: false,
    });

  } catch (error:any) {
    // Don't log to console to avoid showing errors on UI
    // console.error('Login error:', error);
    set({
      isLoading: false,
      error: error.message || "Failed to login. Please check your credentials.",
    });
    throw error;
  }
},

     
    

    register: async (username, email, password, display_name, photo_url) => {
        set({ isLoading: true, error: null, successMessage: null });
        
        try {
  const response = await fetch(`${API_BASE_URL}auth/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, display_name, photo_url }),
          });

  const ct = response.headers.get('content-type') || '';
  const rawText = await response.text();
  const data = ct.includes('application/json') ? JSON.parse(rawText) : { raw: rawText } as any;

          if (!response.ok) {
            throw new Error(data.message || data.error || 'Registration failed');
          }

          // Extract and transform nested user data
          const payload: any = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
          const { token, user: responseUser } = payload;
          const inner = responseUser?.user || responseUser;
          const user: User = {
            id: inner.id,
            username: inner.username,
            email: inner.email,
            display_name: responseUser.display_name ?? inner.display_name ?? inner.username,
            photo_url: responseUser.photo_url || null,
            user: {
              id: inner.id,
              username: inner.username,
              email: inner.email,
            },
            interests: undefined, // New users don't have interests yet
          };

          await AsyncStorage.setItem('auth_token', token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            successMessage: "Registration successful!",
            hasCompletedOnboarding: false,
          });

        } catch (error:any) {
          // Don't log to console to avoid showing errors on UI
          // console.error('Registration error:', error);
          set({
            isLoading: false,
            error: error.message || "Failed to register. Please try again.",
          });
          throw error;
        }
      },

      changePassword: async (old_password, new_password) => {
        const { token } = get();
        if (!token) {
          set({ error: 'Authentication required' });
          return false;
        }
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const resp = await fetch(`${API_BASE_URL}auth/change_password/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ old_password, new_password }),
          });
          const raw = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error(raw?.message || raw?.error || 'Failed to change password');
          }
          set({ isLoading: false, successMessage: raw?.message || 'Password changed successfully' });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err?.message || 'Failed to change password' });
          return false;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const resp = await fetch(`${API_BASE_URL}auth/forgot_password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const raw = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error(raw?.message || raw?.error || 'Failed to request password reset');
          }
          set({ isLoading: false, successMessage: raw?.message || 'OTP sent to email' });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err?.message || 'Failed to request password reset' });
          return false;
        }
      },

      verifyOtp: async (otp) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const resp = await fetch(`${API_BASE_URL}auth/verify_otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp }),
          });
          const raw = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error(raw?.message || raw?.error || 'Failed to verify OTP');
          }
          set({ isLoading: false, successMessage: raw?.message || 'OTP verified' });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err?.message || 'Failed to verify OTP' });
          return false;
        }
      },

      setNewPassword: async (otp, new_password) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const resp = await fetch(`${API_BASE_URL}auth/set_new_password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp, new_password }),
          });
          const raw = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error(raw?.message || raw?.error || 'Failed to set new password');
          }
          set({ isLoading: false, successMessage: raw?.message || 'Password reset successful' });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err?.message || 'Failed to set new password' });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Clear token from storage
          await AsyncStorage.removeItem('auth_token');
          
          // Optional: Call logout endpoint if your API has one
          // const { token } = get();
          // if (token) {
          //   await fetch(`${API_BASE_URL}/logout`, {
          //     method: 'POST',
          //     headers: {
          //       'Authorization': `Bearer ${token}`,
          //       'Content-Type': 'application/json',
          //     },
          //   });
          // }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            successMessage: "Logged out successfully",
          });

        } catch (error:any) {
          // Don't log to console to avoid showing errors on UI
          // console.error('Logout error:', error);
          set({
            isLoading: false,
            error: error.message || "Failed to logout. Please try again.",
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearSuccessMessage: () => {
        set({ successMessage: null });
      },

      // Check if stored token is still valid
      checkTokenValidity: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          // Call a protected endpoint to verify token (tims list requires auth)
          const response = await fetch(`${API_BASE_URL}tims/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            return true;
          } else {
            // Token is invalid, clear it
            await AsyncStorage.removeItem('auth_token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return false;
          }
        } catch (error) {
          console.error('Token validation error:', error);
          // Assume token is invalid on network error
          await AsyncStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // Initialize auth state on app startup
      initAuth: async () => {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          
          if (token) {
            set({ token });
            
            // Verify token is still valid
            const isValid = await get().checkTokenValidity();
            
            if (!isValid) {
              console.log('Stored token is invalid, user needs to login again');
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear potentially corrupted data
          await AsyncStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      updateUserInterests: async (interests: UserInterests) => {
        const { user, token } = get();
        if (!user) {
          console.error('Cannot update interests: User not logged in');
          set({ hasCompletedOnboarding: true }); // Mark as complete even if not logged in
          return false;
        }

        try {
          console.log('Updating user interests:', interests);
          // Ensure interests is an array
          const safeInterests = Array.isArray(interests) ? interests : [];
          
          // Structure data to match backend's UserSerializer and UserProfileSerializer expectation
          const data = {
            id: user.id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            interests: safeInterests, // Send at root level as backend expects
            photo_url: user.photo_url
          };

          console.log('Sending update request with data:', data);

          const response = await fetch(`${API_BASE_URL}users/${user.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
            },
            body: JSON.stringify(data),
          });

          console.log('Response status:', response.status);
          console.log('Response OK:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }

          const updatedUser = await response.json();
          console.log('User updated successfully:', updatedUser);
          
          // Safely update the user object with interests from either location
          set({ 
            user: { 
              ...user, 
              interests: updatedUser?.interests || updatedUser?.profile?.interests || safeInterests
            },
            hasCompletedOnboarding: true 
          });
          
          return true;
        } catch (error) {
          console.error('Error updating interests:', error);
          // Still mark onboarding as complete to prevent UI getting stuck
          set({ hasCompletedOnboarding: true });
          throw error; // Re-throw to let the onboarding form handle it properly
        }
      },
      
      // Locally mark onboarding as complete without contacting the server
      completeOnboardingLocally: () => {
        const current = get().user;
        set({
          user: current ? { ...current } : current,
          hasCompletedOnboarding: true,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper function to get authenticated headers for API calls
export const getAuthHeaders = () => {
  const store = useAuthStore.getState();
  return {
    'Authorization': `Token ${store.token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to make authenticated API calls
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const store = useAuthStore.getState();
  
  if (!store.token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${store.token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};