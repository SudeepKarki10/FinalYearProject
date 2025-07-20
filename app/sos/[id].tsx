import { colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/auth-store';
import { fetchSOSAlertDetails } from '@/store/sos-store';
import type { SOSAlert } from '@/types/sos';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function QuickCallButton({ phone, name, type }: { phone: string; name: string; type: string }) {
  const handleCall = () => {
    const phoneNumber = phone.replace(/\s+/g, ''); // Remove any spaces
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <TouchableOpacity 
      style={styles.callButton} 
      onPress={handleCall}
      activeOpacity={0.7}
    >
      <View style={styles.callButtonContent}>
        <Ionicons name="call" size={24} color={colors.primary} />
        <View style={styles.callButtonText}>
          <Text style={styles.callButtonTitle}>{name}</Text>
          <Text style={styles.callButtonSubtitle}>{type} • {phone}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

interface PhoneContact {
  phone: string;
  name: string;
  type: string;
}

export default function AlertDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const { token } = useAuthStore();

  const fetchAlertDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await fetchSOSAlertDetails(id, token || '');
      
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setAlert(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (token) {
      fetchAlertDetails();
    }
  }, [fetchAlertDetails, token]);

  const getAllPhoneNumbers = (alert: SOSAlert): PhoneContact[] => {
    const numbers: PhoneContact[] = [];
    
    // Add contacted services
    if (alert.contacted_services) {
      alert.contacted_services.forEach(service => {
        if (service.phone) {
          numbers.push({
            phone: service.phone,
            name: service.name,
            type: service.type
          });
        }
      });
    }

    // Add fallback contacts
    if (alert.fallback_contacts) {
      alert.fallback_contacts.forEach(contact => {
        if (contact.phone && !numbers.some(n => n.phone === contact.phone)) {
          numbers.push({
            phone: contact.phone,
            name: contact.name,
            type: contact.type
          });
        }
      });
    }

    // Add unique phone numbers from nearby places
    if (alert.google_places_data) {
      alert.google_places_data.forEach(place => {
        if (place.phone && !numbers.some(n => n.phone === place.phone)) {
          numbers.push({
            phone: place.phone,
            name: place.name,
            type: place.type
          });
        }
      });
    }

    return numbers;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No alert found</Text>
      </View>
    );
  }

  const phoneNumbers = getAllPhoneNumbers(alert);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, {
        backgroundColor: alert.status === 'resolved' ? colors.success + '20' : 
                        alert.status === 'sent' ? colors.warning + '20' : 
                        colors.error + '20'
      }]}>
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, {
          color: alert.status === 'resolved' ? colors.success : 
                 alert.status === 'sent' ? colors.warning : 
                 colors.error
        }]}>
          {alert.status.toUpperCase()}
        </Text>
        <Text style={styles.timeText}>
          {new Date(alert.created_at).toLocaleString()}
        </Text>
      </View>

      {/* Quick Call Section */}
      {phoneNumbers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="call-outline" size={20} color={colors.primary} /> Quick Call
          </Text>
          <View style={styles.callButtonsContainer}>
            {phoneNumbers.map((item, index) => (
              <QuickCallButton
                key={index}
                phone={item.phone}
                name={item.name}
                type={item.type}
              />
            ))}
          </View>
        </View>
      )}

      {/* Emergency Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="warning-outline" size={20} color={colors.primary} /> Emergency Types
        </Text>
        <View style={styles.chipContainer}>
          {alert.selected_types.map((type, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="location-outline" size={20} color={colors.primary} /> Location
        </Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>
            {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
          </Text>
        </View>
      </View>

      {/* Nearby Places */}
      {alert.google_places_data && alert.google_places_data.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="business-outline" size={20} color={colors.primary} /> Nearby Places
          </Text>
          {alert.google_places_data.map((place, index) => (
            <View key={index} style={styles.placeCard}>
              <View style={styles.placeHeader}>
                <Text style={styles.placeName}>{place.name}</Text>
                {place.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{place.rating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.placeDetails}>{place.vicinity}</Text>
              <View style={styles.placeFooter}>
                <Text style={styles.distanceText}>{place.distance_km.toFixed(2)} km away</Text>
                <Text style={styles.typeTag}>{place.type}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'currentColor',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButtonsContainer: {
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  callButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callButtonText: {
    flex: 1,
  },
  callButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  callButtonSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  placeCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text,
  },
  placeDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeTag: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});
