import OnboardingForm from '@/components/OnboardingForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OnboardingForm />
    </SafeAreaView>
  );
}
