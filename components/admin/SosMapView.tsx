import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SOSAlert } from '@/types/sos';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface SosMapViewProps {
  alerts: SOSAlert[];
  onAlertSelect: (alert: SOSAlert) => void;
  selectedAlertId?: number;
}

export default function SosMapView({ alerts, onAlertSelect, selectedAlertId }: SosMapViewProps) {
  const colorScheme = useColorScheme();
  const [mapReady, setMapReady] = useState(false);

  const getMarkerColor = (status: string) => {
    const normalized = status.toLowerCase().replace(/[_\s-]/g, '');
    console.log('Marker status:', status, '-> normalized:', normalized);
    switch (normalized) {
      case 'resolved':
        return 'green'; // Green
      case 'inprogress':
        return 'orange'; // Orange
      case 'sent':
      default:
        return 'red'; // Red
    }
  };

  // Calculate the center and region for the map
  const getMapRegion = () => {
    if (alerts.length === 0) {
      // Default to Nepal's center
      return {
        latitude: 28.3949,
        longitude: 84.1240,
        latitudeDelta: 8,
        longitudeDelta: 8,
      };
    }

    // Calculate bounds
    const latitudes = alerts.map(a => a.latitude);
    const longitudes = alerts.map(a => a.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    const latDelta = (maxLat - minLat) * 1.5 || 0.1;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.1;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.5),
      longitudeDelta: Math.max(lngDelta, 0.5),
    };
  };

  const mapRegion = getMapRegion();

  const styles = StyleSheet.create({
    container: {
      height: 300,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
      position: 'relative',
    },
    map: {
      flex: 1,
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#888' : '#666',
      textAlign: 'center',
    },
    legend: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      backgroundColor: colorScheme === 'dark' ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-around',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 12,
      fontWeight: '500',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
  });

  if (alerts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No SOS alerts to display on map</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {mapReady && alerts.map((alert) => (
          <Marker
            key={alert.id}
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            pinColor={getMarkerColor(alert.status)}
            onPress={() => onAlertSelect(alert)}
            title={`SOS-${alert.id}`}
            description={alert.emergency_type ? 
              (Array.isArray(alert.emergency_type) ? 
                alert.emergency_type.join(', ') : 
                alert.emergency_type
              ) : 'Emergency'
            }
            opacity={selectedAlertId === alert.id ? 1 : 0.8}
          />
        ))}
      </MapView>
      
      {/* Legend */}
      {mapReady && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Sent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
            <Text style={styles.legendText}>Resolved</Text>
          </View>
        </View>
      )}
      
      {!mapReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : colors.text, marginTop: 16 }}>
            Loading map...
          </Text>
        </View>
      )}
    </View>
  );
}
