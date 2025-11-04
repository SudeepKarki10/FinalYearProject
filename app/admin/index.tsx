import AdminSosTab from '@/components/admin/AdminSosTab';
import AdminTimsTab from '@/components/admin/AdminTimsTab';
import StatusDonutChart from '@/components/admin/StatusDonutChart';
import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAdminStore } from '@/store/admin-store';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<'tims' | 'sos'>('tims');
  const router = useRouter();
  const { logout, token } = useAuthStore();
  const { adminPasses, fetchAllTimsPasses } = useAdminStore();

  // Log admin token on component mount
  React.useEffect(() => {
    if (token) {
      console.log('Admin Token:', token);
    }
  }, [token]);

  // Fetch TIMS passes on component mount
  React.useEffect(() => {
    fetchAllTimsPasses();
  }, [fetchAllTimsPasses]);

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    const approved = adminPasses.filter(pass => pass.status?.toLowerCase() === 'approved').length;
    const pending = adminPasses.filter(pass => pass.status?.toLowerCase() === 'pending').length;
    const rejected = adminPasses.filter(pass => pass.status?.toLowerCase() === 'rejected').length;
    
    return { approved, pending, rejected };
  }, [adminPasses]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login' as any);
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#aaa' : colors.text,
      opacity: 0.7,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 12,
    },
    logoutButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    chartSection: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'tims':
        return <AdminTimsTab />;
      case 'sos':
        return <AdminSosTab />;
      default:
        return <AdminTimsTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Status Chart */}
      <View style={styles.chartSection}>
        <StatusDonutChart 
          approved={statusCounts.approved}
          pending={statusCounts.pending}
          rejected={statusCounts.rejected}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tims' && styles.activeTab]}
          onPress={() => setActiveTab('tims')}
        >
          <Text style={[styles.tabText, activeTab === 'tims' && styles.activeTabText]}>
            TIMS Passes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sos' && styles.activeTab]}
          onPress={() => setActiveTab('sos')}
        >
          <Text style={[styles.tabText, activeTab === 'sos' && styles.activeTabText]}>
            SOS Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}