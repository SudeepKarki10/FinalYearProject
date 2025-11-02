import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAdminStore } from '@/store/admin-store';
import { TimsPass } from '@/types/tims';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRScannerModal from './QRScannerModal';
import TimsPassCard from './TimsPassCard';

export default function AdminTimsTab() {
  const colorScheme = useColorScheme();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    isLoading,
    error,
    adminPasses,
    qrVerificationResult,
    fetchAllTimsPasses,
    updatePassStatus,
    clearError,
    clearVerificationResult,
  } = useAdminStore();

  useEffect(() => {
    fetchAllTimsPasses();
  }, [fetchAllTimsPasses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllTimsPasses();
    setRefreshing(false);
  };

  const handleStatusChange = async (passId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updatePassStatus(passId, newStatus);
    } catch {
      Alert.alert('Error', 'Failed to update pass status');
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    clearVerificationResult();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    scanButtonText: {
      color: '#ffffff',
      fontWeight: '500',
      marginLeft: 8,
      fontSize: 14,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#888' : '#666',
      textAlign: 'center',
    },
    listContainer: {
      paddingBottom: 20,
    },
  });

  if (isLoading && adminPasses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : colors.text, marginTop: 16 }}>
          Loading TIMS passes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          clearError();
          fetchAllTimsPasses();
        }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTimsPass = ({ item }: { item: TimsPass }) => (
    <TimsPassCard
      pass={item}
      onStatusChange={(newStatus: 'pending' | 'approved' | 'rejected') => handleStatusChange(item.id, newStatus)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          TIMS Passes ({adminPasses.length})
        </Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleQRScan}>
          <Ionicons name="camera" size={16} color="#ffffff" />
          <Text style={styles.scanButtonText}>Scan TIMS Pass</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {adminPasses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No TIMS passes found</Text>
          </View>
        ) : (
          <FlatList
            data={adminPasses}
            renderItem={renderTimsPass}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <QRScannerModal
        visible={showQRScanner}
        onClose={closeQRScanner}
        verificationResult={qrVerificationResult}
      />
    </View>
  );
}