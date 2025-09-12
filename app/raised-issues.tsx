import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import SosCard, { SOSAlert } from '../components/SosCard';
import { colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from '../store/auth-store';

export default function RaisedIssuesScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);


  const fetchAlerts = async () => {
    const {token} = useAuthStore.getState(); 
    try {
      const response = await fetch(`${API_BASE_URL}sos/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      console.log("Alerts Data : ", data);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {alerts.map((alert) => (
          <SosCard key={alert.id} alert={alert} />
        ))}
        {alerts.length === 0 && (
          <Text style={styles.noAlertsText}>No alerts found</Text>
        )}
      </ScrollView>
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noAlertsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
  },
});
