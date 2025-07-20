import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/Colors';
import { useTimsStore } from '../../store/tims-store';

export default function TimsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentPass, isLoading, error, fetchPassDetails } = useTimsStore();

  useEffect(() => {
    if (id) {
      fetchPassDetails(Number(id));
    }
  }, [id, fetchPassDetails]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !currentPass) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Pass not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image source={{ uri: currentPass.image }} style={styles.profileImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{currentPass.full_name}</Text>
          <Text style={styles.cardNo}>{currentPass.tims_card_no}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoItem label="Nationality" value={currentPass.nationality} />
        <InfoItem label="Passport Number" value={currentPass.passport_number} />
        <InfoItem label="Gender" value={currentPass.gender} />
        <InfoItem label="Date of Birth" value={new Date(currentPass.date_of_birth).toLocaleDateString()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trek Details</Text>
        <InfoItem label="Trek Area" value={currentPass.trekker_area} />
        <InfoItem label="Route" value={currentPass.route} />
        <InfoItem label="Entry Date" value={new Date(currentPass.entry_date).toLocaleDateString()} />
        <InfoItem label="Exit Date" value={new Date(currentPass.exit_date).toLocaleDateString()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nepal Contact</Text>
        <InfoItem label="Contact Name" value={currentPass.nepal_contact_name} />
        <InfoItem label="Organization" value={currentPass.nepal_organization} />
        <InfoItem label="Designation" value={currentPass.nepal_designation} />
        <InfoItem label="Mobile" value={currentPass.nepal_mobile} />
        <InfoItem label="Office Number" value={currentPass.nepal_office_number} />
        <InfoItem label="Address" value={currentPass.nepal_address} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Home Contact</Text>
        <InfoItem label="Contact Name" value={currentPass.home_contact_name} />
        <InfoItem label="City" value={currentPass.home_city} />
        <InfoItem label="Mobile" value={currentPass.home_mobile} />
        <InfoItem label="Office Number" value={currentPass.home_office_number} />
        <InfoItem label="Address" value={currentPass.home_address} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        {Object.entries(currentPass.transit_pass_cost).map(([key, value]) => (
          <InfoItem key={key} label={key} value={`NPR ${value}`} />
        ))}
        <InfoItem label="Total Permit Cost" value={`NPR ${currentPass.permit_cost}`} />
      </View>

      {currentPass.encrypted_qr_code && (
        <View style={styles.qrContainer}>
          <Image 
            source={{ uri: currentPass.encrypted_qr_code }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        </View>
      )}
    </ScrollView>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  cardNo: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    flex: 2,
    fontSize: 14,
    color: colors.text,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});
