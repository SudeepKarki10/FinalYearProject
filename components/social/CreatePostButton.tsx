import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { IconSymbol } from '../ui/IconSymbol';

interface CreatePostButtonProps {
  onPress: () => void;
}

export function CreatePostButton({ onPress }: CreatePostButtonProps) {
  const backgroundColor = useSafeThemeColor({}, 'primary');
  const iconColor = useSafeThemeColor({}, 'background');

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }]} 
      onPress={onPress}
    >
      <IconSymbol name="plus" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
