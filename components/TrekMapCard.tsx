import { Clock, MapPin } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/Colors";
import { Trek } from "../types/trek";

interface TrekMapCardProps {
  trek: Trek;
  onPress: (trek: Trek) => void;
}

export const TrekMapCard: React.FC<TrekMapCardProps> = ({ trek, onPress }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return colors.difficulty.easy;
      case "moderate":
        return colors.difficulty.moderate;
      case "challenging":
        return colors.difficulty.challenging;
      case "extreme":
        return colors.difficulty.extreme;
      default:
        return colors.difficulty.moderate;
    }
  };

  const hasMapData = trek.itinerary_points && trek.itinerary_points.length > 0;

  return (
    <Pressable style={styles.container} onPress={() => onPress(trek)}>
      <Image
        source={{ uri: trek.photos[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {trek.name}
        </Text>

        <View style={styles.detailsRow}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(trek.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{trek.difficulty}</Text>
          </View>

          <View style={styles.detail}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{trek.duration}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {trek.district}, {trek.region}
          </Text>
        </View>

        <View style={styles.mapStatus}>
          {hasMapData ? (
            <Text style={styles.mapAvailable}>Map Available</Text>
          ) : (
            <Text style={styles.mapUnavailable}>Map Coming Soon</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  mapStatus: {
    marginTop: 2,
  },
  mapAvailable: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "500",
  },
  mapUnavailable: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});

export default TrekMapCard;
