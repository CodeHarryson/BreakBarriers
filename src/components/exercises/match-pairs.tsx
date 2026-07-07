import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseFooter, Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MatchPairsExercise } from '@/types/content';

interface Props {
  exercise: MatchPairsExercise;
  onComplete: (correct: boolean) => void;
}

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchPairs({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const yoColumn = useMemo(() => shuffled(exercise.pairs.map((p) => p.yo)), [exercise]);
  const enColumn = useMemo(() => shuffled(exercise.pairs.map((p) => p.en)), [exercise]);
  const [selectedYo, setSelectedYo] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState(false);

  const done = matched.size === exercise.pairs.length;

  const tryMatch = (en: string) => {
    if (!selectedYo) return;
    const pair = exercise.pairs.find((p) => p.yo === selectedYo);
    if (pair && pair.en === en) {
      setMatched((m) => new Set(m).add(selectedYo));
    } else {
      setMissed(true);
    }
    setSelectedYo(null);
  };

  const cell = (label: string, opts: { selected?: boolean; done: boolean; onPress: () => void }) => (
    <Pressable
      accessibilityRole="button"
      key={label}
      disabled={opts.done}
      onPress={opts.onPress}
      style={[
        styles.cell,
        { backgroundColor: theme.backgroundElement },
        opts.selected && { borderColor: Palette.indigo, borderWidth: 2 },
        opts.done && { borderColor: Palette.green, borderWidth: 2, opacity: 0.5 },
      ]}>
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Match the pairs
      </ThemedText>
      <View style={styles.columns}>
        <View style={styles.column}>
          {yoColumn.map((yo) =>
            cell(yo, {
              selected: selectedYo === yo,
              done: matched.has(yo),
              onPress: () => setSelectedYo(yo === selectedYo ? null : yo),
            }),
          )}
        </View>
        <View style={styles.column}>
          {enColumn.map((en) => {
            const pair = exercise.pairs.find((p) => p.en === en);
            const isDone = pair ? matched.has(pair.yo) : false;
            return cell(en, { done: isDone, onPress: () => tryMatch(en) });
          })}
        </View>
      </View>
      {done && (
        <ExerciseFooter
          checked
          correct={!missed}
          canCheck
          correctAnswer=""
          note={missed ? 'All matched — but keep an eye on the ones you missed.' : undefined}
          onCheck={() => {}}
          onContinue={() => onComplete(!missed)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  column: {
    flex: 1,
    gap: Spacing.two,
  },
  cell: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
  },
});
