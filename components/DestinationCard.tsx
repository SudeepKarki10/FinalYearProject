import React from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { colors } from "../constants/Colors";
import { Star } from "lucide-react-native";

interface DestinationCardProps {
  id: string;
  name: string;
  rating: number;
  type: string;
  image: string;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  name,
  rating,
  type,
  image,
}) => {
  return (
    <Link href={`/explore?destination=${id}`} asChild>
      <Pressable style={styles.container}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.type}>{type}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
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
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  dot: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default DestinationCard;
