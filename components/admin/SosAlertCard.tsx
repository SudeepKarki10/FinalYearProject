import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SOSAlert } from '@/types/sos';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SosAlertCardProps {
  alert: SOSAlert;
  onStatusChange: (status: 'sent' | 'inprogress' | 'resolved') => Promise<void>;
  isSelected?: boolean;
}

const normalizeStatus = (status?: string | null): 'sent' | 'inprogress' | 'resolved' => {
  const normalized = (status ?? '').toLowerCase().replace(/[_\s-]/g, '');
  switch (normalized) {
    case 'inprogress':
      return 'inprogress';
    case 'resolved':
      return 'resolved';
    default:
      return 'sent';
  }
};

export default function SosAlertCard({ alert, onStatusChange, isSelected = false }: SosAlertCardProps) {
  const colorScheme = useColorScheme();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'sent' | 'inprogress' | 'resolved'>(
    () => normalizeStatus(alert.status)
  );

  useEffect(() => {
    setCurrentStatus(normalizeStatus(alert.status));
  }, [alert.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return colors.success;
      case 'inprogress':
        return colors.warning;
      case 'sent':
      default:
        return colors.error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'checkmark-circle';
      case 'inprogress':
        return 'hourglass';
      case 'sent':
      default:
        return 'alert-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEmergencyTypeLabel = (type?: string | string[]) => {
    if (!type) return 'General Emergency';
    if (Array.isArray(type)) {
      return type.join(', ');
    }
    return type;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: isSelected ? 2 : 0,
      borderColor: isSelected ? colors.primary : 'transparent',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    statusContainer: {
      position: 'relative',
    },
    statusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusButtonDisabled: {
      opacity: 0.6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    dropdown: {
      position: 'absolute',
      top: 35,
      right: 0,
      backgroundColor: colorScheme === 'dark' ? '#3a3a3a' : '#ffffff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 10,
      zIndex: 9999,
      minWidth: 140,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#555' : '#e0e0e0',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#555' : '#f0f0f0',
    },
    dropdownItemText: {
      fontSize: 14,
      marginLeft: 8,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    content: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      fontWeight: '500',
      width: 120,
    },
    value: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      fontWeight: '400',
      flex: 1,
    },
    emergencyType: {
      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    emergencyTypeText: {
      color: colors.error,
      fontSize: 12,
      fontWeight: '600',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 8,
    },
    locationText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    servicesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#444' : '#f0f0f0',
    },
    servicesLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      marginBottom: 8,
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    serviceText: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#ccc' : colors.textSecondary,
      marginLeft: 8,
    },
    timestamp: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#444' : '#f0f0f0',
    },
    timestampText: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#888' : colors.textSecondary,
      textAlign: 'center',
    },
  });

  const statusOptions: { value: 'sent' | 'inprogress' | 'resolved'; label: string; color: string }[] = [
    { value: 'sent', label: 'Sent', color: colors.error },
    { value: 'inprogress', label: 'In Progress', color: colors.warning },
    { value: 'resolved', label: 'Resolved', color: colors.success },
  ];
  const currentStatusColor = getStatusColor(currentStatus);
  const currentStatusLabel = statusOptions.find((option) => option.value === currentStatus)?.label ?? currentStatus;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.cardNumber}>
            SOS-{alert.id}
          </Text>
          
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { borderColor: currentStatusColor },
                isUpdating && styles.statusButtonDisabled
              ]}
              onPress={() => !isUpdating && setShowStatusMenu(!showStatusMenu)}
              disabled={isUpdating}
            >
              <Ionicons 
                name={getStatusIcon(currentStatus)} 
                size={14} 
                color={currentStatusColor} 
              />
              <Text style={[styles.statusText, { color: currentStatusColor }]}>
                {currentStatusLabel}
              </Text>
              {isUpdating ? (
                <ActivityIndicator 
                  size="small" 
                  color={currentStatusColor}
                  style={{ marginLeft: 4 }}
                />
              ) : (
                <Ionicons 
                  name="chevron-down" 
                  size={12} 
                  color={currentStatusColor} 
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>

            {showStatusMenu && (
              <View style={styles.dropdown}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    disabled={isUpdating}
                    onPress={async () => {
                      if (option.value !== currentStatus) {
                        try {
                          setIsUpdating(true);
                          setShowStatusMenu(false);
                          await onStatusChange(option.value);
                          setCurrentStatus(option.value);
                        } catch (error) {
                          console.error('SosAlertCard: Failed to update status:', error);
                          Alert.alert('Error', 'Failed to update status. Please try again.');
                        } finally {
                          setIsUpdating(false);
                        }
                      } else {
                        setShowStatusMenu(false);
                      }
                    }}
                  >
                    <Ionicons 
                      name={getStatusIcon(option.value)} 
                      size={16} 
                      color={option.color} 
                    />
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                    {option.value === currentStatus && (
                      <Ionicons 
                        name="checkmark" 
                        size={16} 
                        color={option.color}
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {alert.emergency_type && (
            <View style={styles.emergencyType}>
              <Text style={styles.emergencyTypeText}>
                {getEmergencyTypeLabel(alert.emergency_type)}
              </Text>
            </View>
          )}

          {alert.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{alert.description}</Text>
            </View>
          )}

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={colors.success} />
            <Text style={styles.locationText}>
              {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
            </Text>
          </View>

          {alert.contacted_services && alert.contacted_services.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesLabel}>
                Contacted Services ({alert.contacted_services.length})
              </Text>
              {alert.contacted_services.slice(0, 3).map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons 
                    name="call" 
                    size={12} 
                    color={colorScheme === 'dark' ? '#ccc' : colors.textSecondary} 
                  />
                  <Text style={styles.serviceText}>
                    {service.name} - {service.type}
                  </Text>
                </View>
              ))}
              {alert.contacted_services.length > 3 && (
                <Text style={[styles.serviceText, { marginTop: 4 }]}>
                  +{alert.contacted_services.length - 3} more...
                </Text>
              )}
            </View>
          )}

          <View style={styles.timestamp}>
            <Text style={styles.timestampText}>
              Created: {formatDate(alert.created_at)}
            </Text>
            {alert.resolved_at && (
              <Text style={styles.timestampText}>
                Resolved: {formatDate(alert.resolved_at)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
