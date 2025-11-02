import { isAdminRole, useAuthStore } from '@/store/auth-store';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user) {
    return <Redirect href="/auth/login" />;
  }

  if (!isAdminRole(user.role)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}