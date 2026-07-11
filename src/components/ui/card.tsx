import type { ReactNode } from 'react';
import {
  Pressable,
  View,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  type?: ThemeColor;
  selected?: boolean;
  accentColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}

export function Card({
  children,
  onPress,
  type = 'backgroundElement',
  selected = false,
  accentColor,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityState,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const border: ViewStyle = accentColor
    ? { borderWidth: 2, borderColor: accentColor }
    : selected
      ? { borderWidth: 2, borderColor: theme.violet }
      : { borderWidth: 1, borderColor: theme.cardBorder };

  const containerStyle: StyleProp<ViewStyle> = [
    { backgroundColor: theme[type], borderRadius: Radius.lg, padding: Spacing.three },
    border,
    style,
  ];

  if (!onPress) {
    return (
      <View
        style={containerStyle}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (disabled) return;
          scale.value = withTiming(0.98, { duration: 80 });
        }}
        onPressOut={() => {
          if (disabled) return;
          scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        }}
        style={containerStyle}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
