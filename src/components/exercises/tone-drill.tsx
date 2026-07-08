import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseFooter, Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ToneDrillExercise } from '@/types/content';

interface Props {
  exercise: ToneDrillExercise;
  onComplete: (correct: boolean) => void;
}

const TONE_HEIGHT: Record<'L' | 'M' | 'H', number> = { L: 8, M: 28, H: 48 };

/**
 * Visual tone drill: renders each syllable at a height matching its tone
 * (low/mid/high) so learners *see* the pitch melody, then pick the meaning.
 * No audio (deferred with the audio program); the contour is the teaching aid.
 */
export function ToneDrill({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === exercise.answer;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Hear the melody with your eyes — which word is this?
      </ThemedText>

      <View style={[styles.contour, { backgroundColor: theme.backgroundElement }]}>
        {exercise.syllables.map((syl, i) => {
          const tone = exercise.tones[i] ?? 'M';
          return (
            <View key={i} style={styles.syllable}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.dot,
                    { bottom: TONE_HEIGHT[tone], backgroundColor: Palette.indigo },
                  ]}
                />
              </View>
              <ThemedText type="smallBold">{syl}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {tone}
              </ThemedText>
            </View>
          );
        })}
      </View>
      <ThemedText type="title" style={styles.word}>
        {exercise.prompt}
      </ThemedText>

      <View style={styles.choices}>
        {exercise.choices.map((choice) => {
          const isSelected = selected === choice;
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
                stateColor ? { borderColor: stateColor, borderWidth: 2 } : null,
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
  contour: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
    borderRadius: 16,
    paddingVertical: Spacing.three,
  },
  syllable: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  track: {
    width: 40,
    height: 64,
    justifyContent: 'flex-end',
  },
  dot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  word: {
    textAlign: 'center',
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
