import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/Colors";
import { Trek } from "../types";

// Conditionally import MapView to handle web environment
let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_DEFAULT: any;

// Only import the map components on native platforms
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

const TrekMapView: React.FC<TrekMapViewProps> = ({ trek }) => {
  // Only show map if not on web
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.noDataText}>
          Maps are not available in web preview. Please check on a mobile device.
        </Text>
      </View>
    );
  }

  // Check if MapView loaded correctly
  if (!MapView) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/map-placeholder.png")}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.trekName}>{trek.name}</Text>
          <Text style={styles.trekLocation}>{trek.district}, {trek.region}</Text>
          <Text style={styles.mapInfo}>Map component failed to load</Text>
        </View>
      </View>
    );
  }

  const hasItineraryPoints = trek.itinerary_points && trek.itinerary_points.length > 0;
  console.log("Trek data:", trek);

  // If no itinerary points available, show placeholder
  if (!hasItineraryPoints) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/map-placeholder.png")}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.trekName}>{trek.name}</Text>
          <Text style={styles.trekLocation}>{trek.district}, {trek.region}</Text>
          <Text style={styles.mapInfo}>No map data available for this trek</Text>
        </View>
      </View>
    );
  }

  // Calculate the initial region to fit all points
  const latitudes = trek.itinerary_points!.map((p) => p.lat);
  const longitudes = trek.itinerary_points!.map((p) => p.lng);

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
  const routeCoordinates = trek.itinerary_points!.map((point) => ({
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
            strokeColor={colors.primary || "#4A90E2"}
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        )}

        {/* Render markers for each itinerary point */}
        {trek.itinerary_points!.map((point, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            title={point.name || `Stop ${index + 1}`}
            description={`Stop ${index + 1} on the trek`}
            pinColor={
              index === 0
                ? "green"
                : index === trek.itinerary_points!.length - 1
                ? "red"
                : colors.primary || "blue"
            }
          />
        ))}
      </MapView>
      
      <View style={styles.overlay}>
        <Text style={styles.trekName}>{trek.name}</Text>
        <Text style={styles.trekLocation}>{trek.district}, {trek.region}</Text>
        <Text style={styles.mapInfo}>
          {trek.itinerary_points!.length} points along the route
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.background || "#F5F5F5",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
  },
  trekName: {
    color: colors.white || "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  trekLocation: {
    color: colors.white || "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
  },
  mapInfo: {
    color: colors.white || "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: colors.textSecondary || "#666666",
    fontSize: 16,
  },
});

export default TrekMapView;
