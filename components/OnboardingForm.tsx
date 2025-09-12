import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors';
import { UserInterests, useAuthStore } from '../store/auth-store';
import { useTrekStore } from '../store/trek-store';

interface InterestCategory {
  id: string;
  title: string;
  emoji: string;
  options: string[];
}

const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'geography',
    title: 'Geography',
    emoji: '🏔️',
    options: ["Mountains", "Hills", "Lakes", "Forests", "Valleys"]
  },
  {
    id: 'experience',
    title: 'Experience',
    emoji: '🧭',
    options: ["Adventure", "Leisure", "Spiritual", "Cultural Immersion", "Historical Sites"]
  },
  {
    id: 'difficulty',
    title: 'Difficulty Level',
    emoji: '🔥',
    options: ["Easy", "Moderate", "Challenging", "High Altitude"]
  },
  {
    id: 'scenery',
    title: 'Scenic Features',
    emoji: '📸',
    options: ["Panoramic Views", "Villages", "Wildlife", "Sunrise/Sunset", "Snowy Mountains"]
  },
  {
    id: 'season',
    title: 'Best Seasons',
    emoji: '🗓️',
    options: ["Spring", "Autumn", "Winter", "Monsoon"]
  },
  {
    id: 'travelStyle',
    title: 'Travel Style',
    emoji: '🎒',
    options: ["Solo Trekking", "Group Trek", "Family-Friendly", "Remote Areas"]
  }
];

export default function OnboardingForm() {
  const { updateUserInterests, completeOnboardingLocally } = useAuthStore();
  const { fetchRecommendedTreks } = useTrekStore();
  const [selectedInterests, setSelectedInterests] = useState<UserInterests>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Remove the useEffect that fetches recommendations before user submits interests
  // We'll fetch recommendations after interests are submitted

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const { replace } = useRouter();
  
  const handleSubmit = async () => {
    if (isNavigating) return; // Prevent multiple submissions
    
    setIsNavigating(true);
    let recommendationsFetched = false;
    
    try {
      // Only update interests if user has selected some
      if (selectedInterests.length > 0) {
        console.log('Updating user interests:', selectedInterests);
        const updateResult = await updateUserInterests(selectedInterests);
        console.log('User interests update result:', updateResult);
        
        // Proceed with recommendations if we got any kind of successful response
        if (updateResult) {
          console.log('User interests updated successfully, fetching recommendations...');
          try {
            // Wait a bit longer to ensure backend has processed the interest update
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchRecommendedTreks();
            console.log('Recommendations fetched successfully');
            recommendationsFetched = true;
          } catch (recError) {
            console.error('Failed to fetch recommendations:', recError);
            // Log more details about the error
            if (recError instanceof Error) {
              console.error('Error details:', {
                message: recError.message,
                name: recError.name,
                stack: recError.stack
              });
            }
          }
        } else {
          console.warn('Interest update may not have succeeded:', updateResult);
        }
      } else {
        console.log('Skipping without interests...');
        // Mark onboarding complete locally when no interests are chosen
        completeOnboardingLocally();
      }
    } catch (error) {
      console.error('Failed in onboarding process:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      // Ensure onboarding is marked complete locally so UI can proceed
      completeOnboardingLocally();
    }
    
    // Only navigate after ensuring recommendations are fetched or there was an error
    try {
      // If we successfully fetched recommendations, wait a moment to ensure they're processed
      if (recommendationsFetched) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      console.log('Navigating to tabs...');
      replace('/(tabs)');
    } catch (navError) {
      console.error('Navigation error:', navError);
      if (navError instanceof Error) {
        console.error('Navigation error details:', {
          message: navError.message,
          name: navError.name,
          stack: navError.stack
        });
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const renderCategory = (category: InterestCategory) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{category.emoji} {category.title}</Text>
      <View style={styles.optionsContainer}>
        {category.options.map(interest => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestButton,
              selectedInterests.includes(interest) && styles.selectedInterest,
            ]}
            onPress={() => toggleInterest(interest)}
          >
            <Text
              style={[
                styles.interestText,
                selectedInterests.includes(interest) && styles.selectedInterestText,
              ]}
            >
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

const handleSkip = async () => {
  if (isNavigating) return;
  
  setIsNavigating(true);
  
  try {
    console.log('Skipping onboarding...');
  // Mark onboarding complete locally without API calls
  completeOnboardingLocally();
    replace('/(tabs)');
  } catch (navError) {
    console.error('Navigation error:', navError);
    setIsNavigating(false);
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Help us personalize your experience</Text>
            <Text style={styles.subtitle}>What kind of treks are you interested in?</Text>
          </View>
        
          {/* Always show skip button for onboarding */}
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            activeOpacity={0.7}
            disabled={isNavigating}
          >
            <Text style={styles.skipButtonText}>
              {isNavigating ? 'Skipping...' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {INTEREST_CATEGORIES.map(category => (
          <React.Fragment key={category.id}>
            {renderCategory(category)}
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isNavigating}
        >
          <Text style={styles.submitButtonText}>
            {isNavigating ? 'Redirecting...' : (selectedInterests.length === 0 ? 'Skip & Continue' : 'Continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    flex: 1,
    paddingRight: 16, // Add space for the skip button
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    zIndex: 1,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  footer: {
    padding: 16,
    paddingBottom: 32, // Extra padding to stay above tab bar
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedInterest: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedInterestText: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 55,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
