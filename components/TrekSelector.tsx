import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import { getAuthHeaders } from '../store/auth-store';
import { ThemedText } from './ThemedText';

// Define Trek interface
interface Trek {
  id: number;
  name: string;
  image?: string;
}

interface TrekSelectorProps {
  onSelectTrek: (trekId: number) => void;
  selectedTrekId?: number;
}

export function TrekSelector({ onSelectTrek, selectedTrekId }: TrekSelectorProps) {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    try {
      setLoading(true);
      setError('');

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}treks/`, {
        headers,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add a "General" trek at the top
        const generalTrek = { id: 1, name: "General Post" };
        setTreks([generalTrek, ...data.data]);
        
        // Select first trek by default if none selected
        if (!selectedTrekId && data.data.length > 0) {
          onSelectTrek(generalTrek.id);
        }
      } else {
        setError('Failed to load treks');
      }
    } catch (error) {
      setError('Error fetching treks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" style={styles.loader} />;
  }

  if (error) {
    return <ThemedText style={styles.error}>{error}</ThemedText>;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Select Trek:</ThemedText>
      <FlatList
        data={treks}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.trekItem,
              selectedTrekId === item.id && styles.selectedTrek,
            ]}
            onPress={() => onSelectTrek(item.id)}
          >
            <ThemedText style={styles.trekName}>{item.name}</ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    paddingVertical: 8,
  },
  trekItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedTrek: {
    backgroundColor: '#007AFF',
  },
  trekName: {
    fontWeight: '500',
  },
  loader: {
    marginVertical: 16,
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
});
