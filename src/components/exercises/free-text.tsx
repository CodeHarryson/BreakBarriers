import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ExerciseFooter } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { applyToneMark, YorubaKeyBar } from '@/components/yoruba-key-bar';
import { Spacing } from '@/constants/theme';
import { gradeFreeText, type GradeResult } from '@/lib/grading';
import { useTheme } from '@/hooks/use-theme';
import type { FreeTextExercise } from '@/types/content';

interface Props {
  exercise: FreeTextExercise;
  onComplete: (correct: boolean) => void;
}

export function FreeText({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const toYoruba = exercise.direction === 'en->yo';

  const check = () => setResult(gradeFreeText(value, exercise.accepted));

  // Lenient grading: undiacritized input is correct but earns a tone tip.
  const note =
    result?.correct && result.toneTip
      ? `Correct! Watch the tone marks: ${exercise.accepted[0]}${exercise.note ? ` — ${exercise.note}` : ''}`
      : exercise.note;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {toYoruba ? 'Type in Yorùbá' : 'Type in English'}
      </ThemedText>
      <ThemedText type="subtitle">{exercise.prompt}</ThemedText>

      <TextInput
        value={value}
        onChangeText={setValue}
        editable={result === null}
        accessibilityLabel={`Translate ${exercise.prompt} into ${toYoruba ? 'Yoruba' : 'English'}`}
        placeholder={toYoruba ? 'Àpèsì rẹ…' : 'Your answer…'}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
      />

      {toYoruba && result === null && (
        <YorubaKeyBar
          onInsert={(t) => setValue((v) => v + t)}
          onToneMark={(c) => setValue((v) => applyToneMark(v, c))}
        />
      )}

      <ExerciseFooter
        checked={result !== null}
        correct={result?.correct ?? false}
        canCheck={value.trim().length > 0}
        correctAnswer={exercise.accepted[0]}
        note={note}
        onCheck={check}
        onContinue={() => onComplete(result?.correct ?? false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 20,
    minHeight: 56,
  },
});
