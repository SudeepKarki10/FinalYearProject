// Utility function to test admin functionality
// This is for development/testing purposes only

import { useAuthStore } from '../store/auth-store';

export const createTestAdminUser = () => {
  const authStore = useAuthStore.getState();
  
  // Simulate admin login response
  const adminUser = {
    id: 999,
    username: 'admin',
    email: 'admin@treknepal.com',
    display_name: 'System Administrator',
    photo_url: null,
    role: 'admin',
    user: {
      id: 999,
      username: 'admin',
      email: 'admin@treknepal.com',
    },
    interests: [],
  };

  // Manually set admin user (for testing only)
  authStore.user = adminUser;
  authStore.token = 'test-admin-token';
  authStore.isAuthenticated = true;
  authStore.hasCompletedOnboarding = true;
};

export const loginAsAdmin = async () => {
  const { login } = useAuthStore.getState();
  
  try {
    // Try to login with admin credentials
    // Replace with actual admin credentials when available
    await login('admin', 'admin123');
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
};