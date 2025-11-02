import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function AdminSosTab() {
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Alerts</Text>
      <Text style={styles.subtitle}>
        SOS alerts management will be implemented here
      </Text>
    </View>
  );
}