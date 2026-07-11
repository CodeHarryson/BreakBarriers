import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'danger' | 'accent' | 'violet' | 'neutral';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANT_COLORS: Record<Variant, { bg: ThemeColor; press: ThemeColor }> = {
  primary: { bg: 'primary', press: 'primaryPress' },
  danger: { bg: 'danger', press: 'dangerPress' },
  accent: { bg: 'accent', press: 'accentPress' },
  violet: { bg: 'violet', press: 'violetPress' },
  neutral: { bg: 'backgroundSelected', press: 'backgroundSelected' },
};

export function Button({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  style,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const { bg, press } = VARIANT_COLORS[variant];

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (disabled) return;
          scale.value = withTiming(0.96, { duration: 80 });
          translateY.value = withTiming(2, { duration: 80 });
        }}
        onPressOut={() => {
          if (disabled) return;
          scale.value = withSpring(1, { damping: 12, stiffness: 180 });
          translateY.value = withSpring(0, { damping: 12, stiffness: 180 });
        }}
        style={[
          styles.button,
          size === 'lg' ? styles.lg : styles.md,
          disabled
            ? { backgroundColor: theme.backgroundSelected }
            : { backgroundColor: theme[bg], borderBottomWidth: 4, borderBottomColor: theme[press] },
        ]}>
        <ThemedText
          type="default"
          style={[styles.label, { color: disabled ? theme.textSecondary : theme.onColor }]}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  lg: {
    paddingVertical: Spacing.three,
  },
  md: {
    paddingVertical: Spacing.two,
  },
  label: {
    fontWeight: '800',
  },
});
