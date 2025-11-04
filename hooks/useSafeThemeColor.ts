import { ColorValue } from 'react-native';
import { colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useSafeThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof colors
): ColorValue {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  
  const color = colors[colorName];
  // If the color is an object (like the difficulty object), return a default color
  if (typeof color === 'object') {
    return '#000000';
  }
  return color;
}
