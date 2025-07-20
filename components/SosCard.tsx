import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/Colors';

export interface SOSAlert {
  id: number;
  latitude: number;
  longitude: number;
  selected_types: string[];
  status: string;
  created_at: string;
  resolved_at: string | null;
  contacted_services: {
    name: string;
    email: string;
    phone: string;
    type: string;
    fallback: boolean;
  }[];
  google_places_data: {
    name: string;
    vicinity: string;
    rating: number | null;
    distance_km: number;
    type: string;
  }[];
}

interface SosCardProps {
  alert: SOSAlert;
}

export default function SosCard({ alert }: SosCardProps) {
  const router = useRouter();
  const date = new Date(alert.created_at).toLocaleString();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/sos/[id]', params: { id: String(alert.id) } })}
    >
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: alert.resolved_at ? 'green' : 'red' }]} />
          <Text style={styles.status}>{alert.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.typesContainer}>
        {alert.selected_types.map((type, index) => (
          <View key={index} style={styles.typeTag}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        ))}
      </View>

      <View style={styles.locationContainer}>
        <Ionicons name="location" size={16} color={colors.primary} />
        <Text style={styles.locationText}>
          {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.servicesText}>
          {alert.contacted_services.length} services contacted
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  typeTag: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicesText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
