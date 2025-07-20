import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import TimsCard from '../components/TimsCard';
import { colors } from '../constants/Colors';
import { useTimsStore } from '../store/tims-store';

export default function IssuedTimsScreen() {
  const { isLoading, error, passes, fetchPasses } = useTimsStore();
  const router = useRouter();

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

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
        {passes.map((pass) => (
          <TimsCard key={pass.id} pass={pass} />
        ))}
        {passes.length === 0 && (
          <Text style={styles.noPassesText}>No TIMS passes found</Text>
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
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  noPassesText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
  },
});
