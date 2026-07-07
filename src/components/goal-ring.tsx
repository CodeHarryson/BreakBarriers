import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  earned: number;
  goal: number;
  size?: number;
}

/** Daily XP goal ring (resets at local midnight). */
export function GoalRing({ earned, goal, size = 64 }: Props) {
  const theme = useTheme();
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min(earned / goal, 1);
  const met = earned >= goal;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.backgroundSelected}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={met ? Palette.amber : Palette.green}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.label}>
        <ThemedText type="smallBold" style={styles.labelText}>
          {met ? '⚡' : `${earned}`}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 16,
  },
});
