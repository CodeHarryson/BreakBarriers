import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseFooter, Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WordBankExercise } from '@/types/content';

interface Props {
  exercise: WordBankExercise;
  onComplete: (correct: boolean) => void;
}

/** Tokens are addressed by bank index so duplicate words stay distinct. */
export function WordBank({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const answerText = exercise.answer.join(' ');
  const pickedText = picked.map((i) => exercise.tokens[i]).join(' ');
  const correct = pickedText === answerText;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {exercise.direction === 'en->yo' ? 'Build the Yorùbá sentence' : 'Build the English sentence'}
      </ThemedText>
      <ThemedText type="subtitle">{exercise.prompt}</ThemedText>

      <View style={[styles.answerRow, { borderColor: theme.backgroundSelected }]}>
        {picked.length === 0 ? (
          <ThemedText themeColor="textSecondary">Tap words below…</ThemedText>
        ) : (
          picked.map((tokenIndex, i) => (
            <Pressable
              accessibilityRole="button"
              key={`${tokenIndex}-${i}`}
              disabled={checked}
              onPress={() => setPicked((p) => p.filter((_, j) => j !== i))}
              style={[styles.token, { backgroundColor: Palette.indigo }]}>
              <ThemedText style={{ color: '#fff' }}>{exercise.tokens[tokenIndex]}</ThemedText>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.bank}>
        {exercise.tokens.map((token, i) => {
          const used = picked.includes(i);
          return (
            <Pressable
              accessibilityRole="button"
              key={`${token}-${i}`}
              disabled={checked || used}
              onPress={() => setPicked((p) => [...p, i])}
              style={[
                styles.token,
                { backgroundColor: theme.backgroundElement },
                used && { opacity: 0.25 },
              ]}>
              <ThemedText>{token}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ExerciseFooter
        checked={checked}
        correct={correct}
        canCheck={picked.length > 0}
        correctAnswer={answerText}
        note={exercise.note}
        onCheck={() => setChecked(true)}
        onContinue={() => onComplete(correct)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  answerRow: {
    minHeight: 56,
    borderBottomWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  token: {
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
