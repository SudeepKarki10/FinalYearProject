import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TimsPass } from '@/types/tims';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface TimsPassCardProps {
  pass: TimsPass;
  onStatusChange: (status: 'pending' | 'approved' | 'rejected') => void;
}

export default function TimsPassCard({ pass, onStatusChange }: TimsPassCardProps) {
  const colorScheme = useColorScheme();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
      default:
        return colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
      default:
        return 'time';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
      elevation: 5,
      zIndex: 1000,
      minWidth: 120,
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
      textTransform: 'capitalize',
    },
    content: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      fontWeight: '500',
    },
    value: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      fontWeight: '400',
      flex: 1,
      textAlign: 'right',
    },
    imageContainer: {
      marginTop: 12,
      alignItems: 'center',
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.card,
    },
    dates: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#444' : '#f0f0f0',
    },
    dateColumn: {
      flex: 1,
      alignItems: 'center',
    },
    dateLabel: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: colors.warning },
    { value: 'approved', label: 'Approved', color: colors.success },
    { value: 'rejected', label: 'Rejected', color: colors.error },
  ];

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
           <Text style={styles.cardNumber}>
            { `TIMS-${pass.id}`}
          </Text>
          <Text style={styles.cardNumber}>
            {pass.tims_card_no || `TIMS-${pass.id}`}
          </Text>
          
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { borderColor: getStatusColor(pass.status) }
              ]}
              onPress={() => setShowStatusMenu(!showStatusMenu)}
            >
              <Ionicons 
                name={getStatusIcon(pass.status)} 
                size={14} 
                color={getStatusColor(pass.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(pass.status) }]}>
                {pass.status}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={12} 
                color={getStatusColor(pass.status)} 
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>

            {showStatusMenu && (
              <View style={styles.dropdown}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onStatusChange(option.value as 'pending' | 'approved' | 'rejected');
                      setShowStatusMenu(false);
                    }}
                  >
                    <Ionicons 
                      name={getStatusIcon(option.value)} 
                      size={16} 
                      color={option.color} 
                    />
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{pass.full_name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nationality:</Text>
            <Text style={styles.value}>{pass.nationality}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Passport:</Text>
            <Text style={styles.value}>{pass.passport_number}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Trek Area:</Text>
            <Text style={styles.value}>{pass.trekker_area}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Route:</Text>
            <Text style={styles.value}>{pass.route}</Text>
          </View>

          {pass.image && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: pass.image }} 
                style={styles.profileImage} 
                resizeMode="cover"
              />
            </View>
          )}

          <View style={styles.dates}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Entry Date</Text>
              <Text style={styles.dateValue}>{formatDate(pass.entry_date)}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Exit Date</Text>
              <Text style={styles.dateValue}>{formatDate(pass.exit_date)}</Text>
            </View>
          </View>
        </View>
      </View>

      {showStatusMenu && (
        <Modal
          transparent
          visible={showStatusMenu}
          onRequestClose={() => setShowStatusMenu(false)}
        >
          <TouchableOpacity 
            style={styles.overlay} 
            onPress={() => setShowStatusMenu(false)}
          />
        </Modal>
      )}
    </>
  );
}