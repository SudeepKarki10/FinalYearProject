import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Category } from "@/types/trek";
import { colors } from "../constants/Colors";
import { Camera, Map, Mountain, User } from "lucide-react-native";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const getIcon = () => {
    switch (category.icon) {
      case "Mountain":
        return <Mountain size={24} color={category.color} />;
      case "Map":
        return <Map size={24} color={category.color} />;
      case "User":
        return <User size={24} color={category.color} />;
      case "Camera":
        return <Camera size={24} color={category.color} />;
      default:
        return <Mountain size={24} color={category.color} />;
    }
  };

  return (
    <Link href={`/explore?category=${category.id}`} asChild>
      <Pressable style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${category.color}20` },
          ]}
        >
          {getIcon()}
        </View>
        <Text style={styles.name}>{category.name}</Text>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
});

export default CategoryCard;
