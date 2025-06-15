import React from "react";
import { StyleSheet, View, Text, Dimensions, Platform } from "react-native";
import { colors } from "../constants/Colors";
import { Trek } from "../types/trek";

// Conditionally import MapView to handle web environment
let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_DEFAULT: any;

// Only import the map components on native platforms
if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  } catch (e) {
    console.error("Failed to load react-native-maps", e);
    // Keep MapView as undefined or null to prevent rendering errors
    MapView = null;
  }
}

interface TrekMapViewProps {
  trek: Trek;
}

const { width } = Dimensions.get("window");

const TrekMapView: React.FC<TrekMapViewProps> = ({ trek }) => {
  // Only show map if not on web
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height: 300 }]}>
        <Text style={styles.noDataText}>
          Maps are not available in web preview. Please check on a mobile
          device.
        </Text>
      </View>
    );
  }

  // Check if MapView loaded correctly
  if (!MapView) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.noDataText}>Map component failed to load.</Text>
      </View>
    );
  }

  const hasItineraryPoints =
    trek.itinerary_points && trek.itinerary_points.length > 0;
  console.log(trek);

  // If no itinerary points available, show message
  if (!hasItineraryPoints) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.noDataText}>
          No map data available for this trek.
        </Text>
      </View>
    );
  }

  // Calculate the initial region to fit all points
  const latitudes = trek.itinerary_points.map((p) => p.lat);
  const longitudes = trek.itinerary_points.map((p) => p.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Add padding to delta to ensure markers aren't on the edge
  const latitudeDelta = (maxLat - minLat) * 1.5 || 0.02;
  const longitudeDelta = (maxLng - minLng) * 1.5 || 0.02;

  const initialRegion = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latitudeDelta,
    longitudeDelta: longitudeDelta,
  };

  // Create coordinates for the polyline
  const routeCoordinates = trek.itinerary_points.map((point) => ({
    latitude: point.lat,
    longitude: point.lng,
  }));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsPointsOfInterest={true}
      >
        {/* Render polyline connecting points */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary || "#FF6B6B"} // Fallback color if accent not defined
            strokeWidth={3}
            lineDashPattern={[1]} // Optional: creates dashed line effect
          />
        )}

        {/* Render markers for each itinerary point */}
        {trek.itinerary_points.map((point, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            title={point.name}
            description={`Stop ${index + 1} on the trek`}
            pinColor={
              index === 0
                ? "green"
                : index === trek.itinerary_points.length - 1
                ? "red"
                : colors.primary || "blue"
            }
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: colors.textSecondary,
  },
});

export default TrekMapView;
