import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { colors } from "../constants/Colors";
import { Filter } from "lucide-react-native";

interface FilterButtonProps {
  onPress: () => void;
  activeFilters?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onPress,
  activeFilters = 0,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        activeFilters > 0 && styles.active,
      ]}
      onPress={onPress}
    >
      <Filter
        size={16}
        color={activeFilters > 0 ? colors.white : colors.text}
      />
      <Text style={[styles.text, activeFilters > 0 && styles.activeText]}>
        Filters
      </Text>
      {activeFilters > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeFilters}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: 4,
  },
  activeText: {
    color: colors.white,
  },
  badge: {
    backgroundColor: colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default FilterButton;
