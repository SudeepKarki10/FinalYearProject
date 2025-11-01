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

function ContactServiceCard({ service }: { service: any }) {
  const handleEmail = () => {
    if (service.email) {
      Linking.openURL(`mailto:${service.email}`);
    }
  };

  const handleCall = () => {
    if (service.phone) {
      const phoneNumber = service.phone.replace(/\s+/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  return (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <Ionicons name="person-outline" size={20} color={colors.primary} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{service.name}</Text>
          <Text style={styles.contactType}>{service.type} • {service.source || 'default'}</Text>
        </View>
      </View>
      
      <View style={styles.contactActions}>
        {service.email && (
          <TouchableOpacity style={styles.contactActionButton} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.contactActionText}>{service.email}</Text>
          </TouchableOpacity>
        )}
        {service.phone && (
          <TouchableOpacity style={styles.contactActionButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.contactActionText}>{service.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
      console.log('Fetching SOS alert details for ID:', id);
      const { data, error: fetchError } = await fetchSOSAlertDetails(id, token || '');
      
      if (fetchError) {
        console.error('Error fetching SOS alert:', fetchError);
        setError(fetchError);
      } else if (data) {
        console.log('SOS alert data received:', data);
        setAlert(data);
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

  const parseEmergencyTypes = (emergencyType: string | string[]): string[] => {
    if (Array.isArray(emergencyType)) {
      return emergencyType;
    }
    if (typeof emergencyType === 'string') {
      // Handle string representation of array like "['rescue', 'injured']"
      try {
        if (emergencyType.startsWith('[') && emergencyType.endsWith(']')) {
          const parsed = emergencyType.slice(1, -1).split(',').map(item => 
            item.trim().replace(/['"]/g, '')
          );
          return parsed.filter(item => item.length > 0);
        }
        return [emergencyType];
      } catch {
        return [emergencyType];
      }
    }
    return [];
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
        <Ionicons 
          name={alert.status === 'resolved' ? 'checkmark-circle' : 
                alert.status === 'sent' ? 'time' : 'alert-circle'} 
          size={24} 
          color={alert.status === 'resolved' ? colors.success : 
                 alert.status === 'sent' ? colors.warning : 
                 colors.error} 
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.statusText, {
            color: alert.status === 'resolved' ? colors.success : 
                   alert.status === 'sent' ? colors.warning : 
                   colors.error
          }]}>
            {alert.status.toUpperCase()}
          </Text>
          <Text style={styles.timeText}>
            Created: {new Date(alert.created_at).toLocaleString()}
          </Text>
          {alert.resolved_at && (
            <Text style={styles.timeText}>
              Resolved: {new Date(alert.resolved_at).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Alert Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} /> Alert Information
        </Text>
        <View style={styles.alertInfoCard}>
          <View style={styles.alertInfoRow}>
            <Text style={styles.alertInfoLabel}>Alert ID</Text>
            <Text style={styles.alertInfoValue}>#{alert.id}</Text>
          </View>
          <View style={styles.alertInfoRow}>
            <Text style={styles.alertInfoLabel}>Status</Text>
            <Text style={[styles.alertInfoValue, {
              color: alert.status === 'resolved' ? colors.success : 
                     alert.status === 'sent' ? colors.warning : 
                     colors.error
            }]}>
              {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
            </Text>
          </View>
          <View style={[styles.alertInfoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.alertInfoLabel}>Created</Text>
            <Text style={styles.alertInfoValue}>
              {new Date(alert.created_at).toLocaleDateString()} at {new Date(alert.created_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {Boolean(alert.description) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} /> Emergency Description
          </Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{alert.description}</Text>
          </View>
        </View>
      )}

      {/* Contacted Services */}
      {alert.contacted_services && alert.contacted_services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people-outline" size={20} color={colors.primary} /> Emergency Contacts
          </Text>
          {alert.contacted_services.map((service, index) => (
            <ContactServiceCard key={`service-${index}`} service={service} />
          ))}
        </View>
      )}

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
          {alert.emergency_type && (
            <>
              <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8, color: colors.error }]}>
                Primary Emergency:
              </Text>
              {parseEmergencyTypes(alert.emergency_type).map((type, index) => (
                <View key={`primary-${index}`} style={[styles.chip, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.chipText, { color: colors.error }]}>{type}</Text>
                </View>
              ))}
              <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8, marginTop: 12, color: colors.textSecondary }]}>
                Selected Services:
              </Text>
            </>
          )}
          {alert.selected_types && alert.selected_types.map((type, index) => (
            <View key={`selected-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="location-outline" size={20} color={colors.primary} /> Emergency Location
        </Text>
        
        {/* Map View */}
        <View style={styles.mapContainer}>
          <TouchableOpacity 
            style={styles.mapPlaceholder}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`)}
          >
            <Ionicons name="map-outline" size={48} color={colors.primary} />
            <Text style={styles.mapPlaceholderText}>Tap to view on Google Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.alertInfoRow}>
            <Text style={styles.alertInfoLabel}>Latitude</Text>
            <Text style={styles.alertInfoValue}>{alert.latitude.toFixed(6)}</Text>
          </View>
          <View style={[styles.alertInfoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.alertInfoLabel}>Longitude</Text>
            <Text style={styles.alertInfoValue}>{alert.longitude.toFixed(6)}</Text>
          </View>
          
         
        </View>
      </View>

      {/* Fallback Contacts */}
      {alert.fallback_contacts && alert.fallback_contacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="call-outline" size={20} color={colors.primary} /> Fallback Contacts
          </Text>
          {alert.fallback_contacts.map((contact, index) => (
            <ContactServiceCard key={`fallback-${index}`} service={contact} />
          ))}
        </View>
      )}

      {/* Nearby Places */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="business-outline" size={20} color={colors.primary} /> Nearby Emergency Services
        </Text>
        {alert.google_places_data && alert.google_places_data.length > 0 ? (
          alert.google_places_data.map((place, index) => (
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
              {place.phone && (
                <TouchableOpacity
                  style={[styles.contactActionButton, { marginTop: 8 }]}
                  onPress={() => Linking.openURL(`tel:${place.phone}`)}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={styles.contactActionText}>{place.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.alertInfoCard}>
            <Text style={[styles.alertInfoValue, { textAlign: 'center', color: colors.textSecondary }]}>
              No nearby emergency services found for this location
            </Text>
          </View>
        )}
      </View>
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
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
  descriptionCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  contactType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    gap: 8,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    gap: 8,
  },
  contactActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  alertInfoCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  alertInfoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
  },
  mapPlaceholderText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
