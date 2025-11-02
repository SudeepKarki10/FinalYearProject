import OnboardingForm from '@/components/OnboardingForm';
import { isAdminRole, useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAdminRole(user?.role)) {
      router.replace('/admin');
    } else if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [user?.role, isAuthenticated, router]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OnboardingForm />
    </SafeAreaView>
  );
}
