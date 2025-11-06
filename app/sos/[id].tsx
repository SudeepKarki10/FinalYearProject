import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/auth-store';
import { fetchSOSAlertDetails } from '@/store/sos-store';
import type { SOSAlert } from '@/types/sos';
import { getFirstPhoneNumber, hasMultiplePhoneNumbers, initiatePhoneCall } from '@/utils/phoneUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ServiceContact {
  name: string;
  phone?: string; // Made optional since it might not always be available
  type: string;
}

interface NearbyPlace {
  place_id: string;
  name: string;
  address: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  phone?: string; // Made optional to match GooglePlace interface
  website: string;
  type: string;
  business_status: string;
}

function StatusBadge({ status }: { status: string }) {
  const colorScheme = useColorScheme();
  
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return {
          bg: '#E8F5E8',
          border: '#4CAF50',
          text: '#2E7D32',
          icon: 'checkmark-circle' as const,
          label: 'RESOLVED'
        };
      case 'in_progress':
      case 'inprogress':
        return {
          bg: '#FFF3E0',
          border: '#FF9800',
          text: '#E65100',
          icon: 'time' as const,
          label: 'IN PROGRESS'
        };
      default:
        return {
          bg: '#FFEBEE',
          border: '#F44336',
          text: '#C62828',
          icon: 'alert-circle' as const,
          label: 'ACTIVE'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { 
      backgroundColor: colorScheme === 'dark' ? config.border + '20' : config.bg,
      borderColor: config.border 
    }]}>
      <Ionicons name={config.icon} size={18} color={config.border} />
      <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function EmergencyTypeChip({ type, isPrimary = false }: { type: string; isPrimary?: boolean }) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[
      styles.emergencyChip,
      {
        backgroundColor: isPrimary 
          ? (colorScheme === 'dark' ? '#FF5252' : '#F44336')
          : (colorScheme === 'dark' ? colors.primary + '40' : colors.primary + '20'),
        borderColor: isPrimary 
          ? (colorScheme === 'dark' ? '#FF1744' : '#D32F2F')
          : colors.primary,
      }
    ]}>
      <Ionicons 
        name={isPrimary ? 'warning' : 'medical'} 
        size={14} 
        color={isPrimary ? '#FFFFFF' : colors.primary} 
      />
      <Text style={[
        styles.emergencyChipText,
        { color: isPrimary ? '#FFFFFF' : colors.primary }
      ]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
}

function ContactCard({ contact, onCall }: { contact: ServiceContact; onCall: () => void }) {
  const colorScheme = useColorScheme();
  
  const firstPhoneNumber = getFirstPhoneNumber(contact.phone);
  
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
      case 'medical':
        return 'medical';
      case 'police':
        return 'shield-checkmark';
      case 'fire':
        return 'flame';
      default:
        return 'call';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
      case 'medical':
        return '#4CAF50';
      case 'police':
        return '#2196F3';
      case 'fire':
        return '#FF5722';
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.contactCard, {
        backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
        borderColor: colorScheme === 'dark' ? '#404040' : '#E0E0E0',
        opacity: firstPhoneNumber ? 1 : 0.7
      }]}
      onPress={firstPhoneNumber ? onCall : undefined}
      activeOpacity={firstPhoneNumber ? 0.7 : 1}
      disabled={!firstPhoneNumber}
    >
      <View style={[styles.contactIconContainer, { backgroundColor: getTypeColor(contact.type) + '20' }]}>
        <Ionicons name={getTypeIcon(contact.type)} size={24} color={getTypeColor(contact.type)} />
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { 
          color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
        }]} numberOfLines={2}>
          {contact.name}
        </Text>
        <Text style={[styles.contactType, { 
          color: colorScheme === 'dark' ? '#B0B0B0' : colors.textSecondary 
        }]}>
          {contact.type.toUpperCase()}{firstPhoneNumber ? ` • ${firstPhoneNumber}` : ' • No phone available'}
          {hasMultiplePhoneNumbers(contact.phone) && (
            <Text style={{ fontSize: 12, fontStyle: 'italic' }}> (+more)</Text>
          )}
        </Text>
      </View>
      
      <View style={[styles.callButton, { 
        backgroundColor: firstPhoneNumber ? getTypeColor(contact.type) : '#CCCCCC' 
      }]}>
        <Ionicons 
          name={firstPhoneNumber ? "call" : "call-outline"} 
          size={20} 
          color={firstPhoneNumber ? "#FFFFFF" : "#888888"} 
        />
      </View>
    </TouchableOpacity>
  );
}

function NearbyPlaceCard({ place }: { place: NearbyPlace }) {
  const colorScheme = useColorScheme();
  
  const firstPhoneNumber = getFirstPhoneNumber(place.phone);
  
  const handleCall = () => {
    if (firstPhoneNumber) {
      initiatePhoneCall(firstPhoneNumber);
    }
  };

  const handleNavigate = () => {
    const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.placeCard, {
      backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
      borderColor: colorScheme === 'dark' ? '#404040' : '#E0E0E0'
    }]}>
      <View style={styles.placeHeader}>
        <View style={styles.placeInfo}>
          <Text style={[styles.placeName, { 
            color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
          }]} numberOfLines={2}>
            {place.name}
          </Text>
          <Text style={[styles.placeAddress, { 
            color: colorScheme === 'dark' ? '#B0B0B0' : colors.textSecondary 
          }]} numberOfLines={1}>
            {place.vicinity}
          </Text>
        </View>
        
        <View style={styles.placeDistance}>
          <Text style={[styles.distanceText, { 
            color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
          }]}>
            {place.distance_km.toFixed(1)}km
          </Text>
        </View>
      </View>
      
      <View style={styles.placeActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.navigateButton]}
          onPress={handleNavigate}
        >
          <Ionicons name="navigate" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Navigate</Text>
        </TouchableOpacity>
        
        {firstPhoneNumber && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.callActionButton]}
            onPress={handleCall}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function AlertDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const { token } = useAuthStore();

  const fetchAlertDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching SOS alert details for ID:', id);
      const { data, error: fetchError } = await fetchSOSAlertDetails(id, token || '');
      
      if (fetchError) {
        console.error('Error fetching SOS alert:', fetchError);
        setError(fetchError);
      } else if (data) {
        console.log('SOS alert data received:', data);
        setAlert(data);
        // Here you would also fetch the SOS response data from your backend
        // For now, I'll simulate it based on the alert data
      } else {
        console.error('No data received for SOS alert');
        setError('Alert not found');
      }
    } catch (err) {
      console.error('Unexpected error fetching SOS alert:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (token) {
      fetchAlertDetails();
    }
  }, [fetchAlertDetails, token]);

  const handleCallContact = (contact: ServiceContact) => {
    const firstPhoneNumber = getFirstPhoneNumber(contact.phone);
    
    if (!firstPhoneNumber) {
      Alert.alert('Error', 'No phone number available for this contact');
      return;
    }

    Alert.alert(
      'Call Emergency Service',
      `Do you want to call ${contact.name}?${hasMultiplePhoneNumbers(contact.phone) ? '\n(Will call the first number)' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            initiatePhoneCall(firstPhoneNumber);
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? '#FFFFFF' : colors.text }]}>
          Loading emergency details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="warning" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchAlertDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>No alert found</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView 
        style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5' }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Emergency Badge */}
        <View style={[styles.emergencyHeader, {
          backgroundColor: colorScheme === 'dark' ? '#FF5252' : '#F44336'
        }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
              <Text style={styles.alertId}>SOS-{alert.id}</Text>
            </View>
            <StatusBadge status={alert.status} />
          </View>
          
          <View style={styles.emergencyDetails}>
            <View style={styles.emergencyDetailItem}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
              <Text style={styles.emergencyDetailText}>
                {new Date(alert.created_at).toLocaleString()}
              </Text>
            </View>
            <View style={styles.emergencyDetailItem}>
              <Ionicons name="location-outline" size={16} color="#FFFFFF" />
              <Text style={styles.emergencyDetailText}>
                {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        {alert.description && (
          <View style={[styles.card, {
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF'
          }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { 
                color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
              }]}>
                Emergency Description
              </Text>
            </View>
            <Text style={[styles.descriptionText, { 
              color: colorScheme === 'dark' ? '#E0E0E0' : colors.text 
            }]}>
              {alert.description}
            </Text>
          </View>
        )}

        {/* Emergency Types */}
        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF'
        }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={[styles.cardTitle, { 
              color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
            }]}>
              Emergency Classification
            </Text>
          </View>
          <View style={styles.chipContainer}>
            {alert.emergency_type && (
              <EmergencyTypeChip type={alert.emergency_type.toString()} isPrimary />
            )}
            {alert.selected_types?.map((type, index) => (
              <EmergencyTypeChip key={index} type={type} />
            ))}
          </View>
        </View>


        {/* Emergency Contacts */}
        {alert.contacted_services && alert.contacted_services.length > 0 && (
          <View style={[styles.card, {
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF'
          }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={20} color={colors.success} />
              <Text style={[styles.cardTitle, { 
                color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
              }]}>
                Emergency Contacts ({alert.contacted_services.length})
              </Text>
            </View>
            <View style={styles.contactsList}>
              {alert.contacted_services.map((service, index) => (
                <ContactCard
                  key={index}
                  contact={{
                    name: service.name,
                    phone: service.phone,
                    type: service.type
                  }}
                  onCall={() => handleCallContact({
                    name: service.name,
                    phone: service.phone,
                    type: service.type
                  })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Nearby Emergency Services */}
        {alert.google_places_data && alert.google_places_data.length > 0 && (
          <View style={[styles.card, {
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF'
          }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={20} color={colors.info} />
              <Text style={[styles.cardTitle, { 
                color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
              }]}>
                Nearby Services ({alert.google_places_data.length})
              </Text>
            </View>
            <View style={styles.nearbyPlacesList}>
              {alert.google_places_data.slice(0, 5).map((place, index) => (
                <NearbyPlaceCard
                  key={index}
                  place={{
                    place_id: place.place_id,
                    name: place.name,
                    address: place.address || place.vicinity,
                    vicinity: place.vicinity,
                    rating: place.rating || 0,
                    user_ratings_total: 0,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    distance_km: place.distance_km,
                    phone: place.phone,
                    website: place.website,
                    type: place.type,
                    business_status: 'OPERATIONAL'
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Alert Timeline */}
        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF'
        }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={colors.textSecondary} />
            <Text style={[styles.cardTitle, { 
              color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
            }]}>
              Alert Timeline
            </Text>
          </View>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: colors.error }]}>
                <Ionicons name="warning" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { 
                  color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
                }]}>
                  Emergency Alert Created
                </Text>
                <Text style={[styles.timelineTime, { 
                  color: colorScheme === 'dark' ? '#B0B0B0' : colors.textSecondary 
                }]}>
                  {new Date(alert.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
            
            {alert.resolved_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { 
                    color: colorScheme === 'dark' ? '#FFFFFF' : colors.text 
                  }]}>
                    Emergency Resolved
                  </Text>
                  <Text style={[styles.timelineTime, { 
                    color: colorScheme === 'dark' ? '#B0B0B0' : colors.textSecondary 
                  }]}>
                    {new Date(alert.resolved_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyHeader: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  alertId: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  emergencyDetails: {
    gap: 8,
  },
  emergencyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyDetailText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emergencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  emergencyChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactType: {
    fontSize: 14,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyPlacesList: {
    gap: 12,
  },
  placeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
  },
  placeDistance: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  navigateButton: {
    backgroundColor: colors.primary,
  },
  callActionButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
  },
});
