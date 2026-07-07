import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseFooter, Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SelectTranslationExercise } from '@/types/content';

interface Props {
  exercise: SelectTranslationExercise;
  onComplete: (correct: boolean) => void;
}

export function SelectTranslation({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === exercise.answer;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {exercise.direction === 'yo->en' ? 'Translate to English' : 'Translate to Yorùbá'}
      </ThemedText>
      <ThemedText type="subtitle">{exercise.prompt}</ThemedText>
      <View style={styles.choices}>
        {exercise.choices.map((choice) => {
          const isSelected = selected === choice;
          const showState = checked && (choice === exercise.answer || isSelected);
          const stateColor =
            checked && choice === exercise.answer
              ? Palette.green
              : checked && isSelected
                ? Palette.red
                : undefined;
          return (
            <Pressable
              accessibilityRole="button"
              key={choice}
              disabled={checked}
              onPress={() => setSelected(choice)}
              style={[
                styles.choice,
                { backgroundColor: theme.backgroundElement },
                isSelected && !checked && { borderColor: Palette.indigo, borderWidth: 2 },
                showState && stateColor ? { borderColor: stateColor, borderWidth: 2 } : null,
              ]}>
              <ThemedText>{choice}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      <ExerciseFooter
        checked={checked}
        correct={correct}
        canCheck={selected !== null}
        correctAnswer={exercise.answer}
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
  choices: {
    gap: Spacing.two,
  },
  choice: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
