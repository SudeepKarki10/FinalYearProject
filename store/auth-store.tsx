import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE_URL = "https://treknepal.onrender.com/api";

interface User {
  id: string | number;  // Allow both string and number
  username: string;
  email: string;
  display_name: string;
  photo_url?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, display_name: string, photo_url: string | null) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  initAuth: () => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
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

     login: async (username, password) => {
  set({ isLoading: true, error: null, successMessage: null });
  
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Extract and transform nested user data
    const { token, user: responseUser } = data;
    const user: User = {
      id: responseUser.user.id,  // Preserve as number
      username: responseUser.user.username,
      email: responseUser.user.email,
      display_name: responseUser.display_name,
      photo_url: responseUser.photo_url || null,
    };

    await AsyncStorage.setItem('auth_token', token);

    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      successMessage: "Login successful!",
    });

  } catch (error:any) {
    // ... error handling remains the same ...
     console.error('Login error:', error);
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
    const response = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, display_name, photo_url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // Extract and transform nested user data
    const { token, user: responseUser } = data;
    const user: User = {
      id: responseUser.user.id,  // Preserve as number
      username: responseUser.user.username,
      email: responseUser.user.email,
      display_name: responseUser.display_name,
      photo_url: responseUser.photo_url || null,
    };

    await AsyncStorage.setItem('auth_token', token);

    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      successMessage: "Registration successful!",
    });

  } catch (error:any) {
          console.error('Registration error:', error);
          set({
            isLoading: false,
            error: error.message || "Failed to register. Please try again.",
          });
          throw error;
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
          console.error('Logout error:', error);
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
          // Call a protected endpoint to verify token
          const response = await fetch(`${API_BASE_URL}/verify-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
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
  const { token } = useAuthStore.getState();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to make authenticated API calls
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};