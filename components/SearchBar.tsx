import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { colors } from "../constants/Colors";
import { Search, X } from "lucide-react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search treks, districts, or attractions...",
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {value.length > 0 && (
        <Pressable
          style={styles.clearButton}
          onPress={() => {
            onChangeText("");
            if (onClear) onClear();
          }}
        >
          <X size={16} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
