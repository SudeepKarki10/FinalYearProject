import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/Colors';
import { TimsPass } from '../types/tims';

interface TimsCardProps {
  pass: TimsPass;
}

export default function TimsCard({ pass }: TimsCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push({ pathname: '/tims/[id]', params: { id: String(pass.id) } })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: pass.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{pass.full_name}</Text>
          <Text style={styles.cardNo}>{pass.tims_card_no}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailText}>Trek: {pass.trekker_area}</Text>
          <Text style={styles.detailText}>Status: <Text style={[styles.status, { color: getStatusColor(pass.status) }]}>{pass.status}</Text></Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.date}>Issue Date: {new Date(pass.issue_date).toLocaleDateString()}</Text>
          <Text style={styles.payment}>Payment: {pass.payment_status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return colors.success;
    case 'rejected':
      return colors.error;
    default:
      return colors.warning;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardNo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  details: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  status: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  payment: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
