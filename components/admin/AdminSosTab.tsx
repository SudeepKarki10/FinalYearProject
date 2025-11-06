import { colors } from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/config';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/auth-store';
import { SOSAlert } from '@/types/sos';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SosAlertCard from './SosAlertCard';
import SosMapView from './SosMapView';

interface FetchAllSOSAlertsResponse {
  data: SOSAlert[] | null;
  error: string | null;
}

async function fetchAllSOSAlerts(token: string): Promise<FetchAllSOSAlertsResponse> {
  if (!token) {
    return { data: null, error: 'Authentication required' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}admin/sos/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    const ct = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const raw = ct.includes('application/json') ? JSON.parse(rawText) : rawText;

    if (!response.ok) {
      // If admin endpoint doesn't exist, try the regular endpoint
      if (response.status === 404) {
        const fallbackResponse = await fetch(`${API_BASE_URL}sos/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        const fallbackCt = fallbackResponse.headers.get('content-type') || '';
        const fallbackRawText = await fallbackResponse.text();
        const fallbackRaw = fallbackCt.includes('application/json') ? JSON.parse(fallbackRawText) : fallbackRawText;

        if (!fallbackResponse.ok) {
          const msg = typeof fallbackRaw === 'string' ? fallbackRaw : (fallbackRaw?.message || fallbackRaw?.error || 'Failed to fetch SOS alerts');
          throw new Error(msg);
        }

        const fallbackData = (fallbackRaw && typeof fallbackRaw === 'object' && 'data' in fallbackRaw) ? (fallbackRaw as any).data : fallbackRaw;
        return { data: Array.isArray(fallbackData) ? (fallbackData as SOSAlert[]) : [], error: null };
      }

      const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || 'Failed to fetch SOS alerts');
      throw new Error(msg);
    }

    const data = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
    return { data: Array.isArray(data) ? (data as SOSAlert[]) : [], error: null };
  } catch (err) {
    console.error('Error fetching all SOS alerts:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load SOS alerts' };
  }
}

export default function AdminSosTab() {
  const colorScheme = useColorScheme();
  const { token } = useAuthStore();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<number | undefined>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAlertId, setModalAlertId] = useState<number | undefined>();
  const flatListRef = React.useRef<FlatList>(null);

  const loadAlerts = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchAllSOSAlerts(token);
      if (response.error) {
        setError(response.error);
      } else {
        setAlerts(response.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, [loadAlerts]);

  const handleStatusChange = useCallback(async (alertId: number, status: 'sent' | 'inprogress' | 'resolved') => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}sos/${alertId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: status === 'inprogress' ? 'in_progress' : status }
          : alert
      ));
      
      // If we're viewing this alert in the modal, update the modal as well
      if (modalVisible && modalAlertId === alertId) {
        // Keep modal open but the data will be updated in the state
      }
    } catch (err) {
      throw err;
    }
  }, [token, modalVisible, modalAlertId]);

  const handleAlertSelect = useCallback((alert: SOSAlert) => {
    setSelectedAlertId(alert.id);
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
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
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#888' : colors.textSecondary,
      textAlign: 'center',
    },
    listContainer: {
      padding: 16,
    },
    alertItemContainer: {
      marginBottom: 12,
    },
    alertViewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
      borderRadius: 6,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    alertViewAllButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
      marginLeft: 6,
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    singleAlertView: {
      flex: 1,
    },
    headerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      flex: 1,
      marginRight: 8,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.primary,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      marginLeft: 8,
    },
    viewAllButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ffffff',
      marginLeft: 8,
    },
    selectedAlertTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    selectedAlertContainer: {
      backgroundColor: colorScheme === 'dark' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colorScheme === 'dark' ? '#3a3a3a' : '#f0f0f0',
    },
    modalContent: {
      flex: 1,
    },
    modalScrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    modalErrorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : colors.text, marginTop: 16 }}>
          Loading SOS alerts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No SOS alerts found</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (selectedAlertId) {
      // Show only the selected alert
      const selectedAlert = alerts.find(alert => alert.id === selectedAlertId);
      if (selectedAlert) {
        return (
          <View style={styles.singleAlertView}>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedAlertId(undefined)}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.backButtonText}>
                  Back to All Alerts
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  setModalAlertId(selectedAlert.id);
                  setModalVisible(true);
                }}
              >
                <Ionicons 
                  name="expand-outline" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.viewAllButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.selectedAlertTitle}>SOS-{selectedAlert.id} Details</Text>
            
            <View style={styles.selectedAlertContainer}>
              <SosAlertCard
                alert={selectedAlert}
                onStatusChange={(status) => handleStatusChange(selectedAlert.id, status)}
                isSelected={true}
              />
            </View>
          </View>
        );
      }
    }

    // Show all alerts when no specific alert is selected
    return (
      <FlatList
        ref={flatListRef}
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true,
              viewPosition: 0.5 
            });
          });
        }}
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
    );
  };

  const renderAlert = ({ item }: { item: SOSAlert }) => (
    <View style={styles.alertItemContainer}>
      <SosAlertCard
        alert={item}
        onStatusChange={(status) => handleStatusChange(item.id, status)}
        isSelected={false}
      />
      <TouchableOpacity
        style={styles.alertViewAllButton}
        onPress={() => {
          setModalAlertId(item.id);
          setModalVisible(true);
        }}
      >
        <Ionicons name="expand-outline" size={16} color={colors.primary} />
        <Text style={styles.alertViewAllButtonText}>View Full Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SosMapView
        alerts={alerts}
        onAlertSelect={handleAlertSelect}
        selectedAlertId={selectedAlertId}
      />
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      {/* Modal for detailed view */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalAlertId ? `SOS-${modalAlertId} Full Details` : 'Alert Details'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {modalAlertId && (
              (() => {
                const modalAlert = alerts.find(alert => alert.id === modalAlertId);
                return modalAlert ? (
                  <SosAlertCard
                    alert={modalAlert}
                    onStatusChange={(status) => handleStatusChange(modalAlert.id, status)}
                    isSelected={false}
                  />
                ) : (
                  <Text style={styles.modalErrorText}>Alert not found</Text>
                );
              })()
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}