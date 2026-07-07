import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export const Palette = {
  green: '#58CC02',
  greenDark: '#46A302',
  red: '#FF4B4B',
  redDark: '#D33131',
  amber: '#FFB100',
  indigo: '#4B3F72',
};

interface Props {
  checked: boolean;
  correct: boolean;
  canCheck: boolean;
  correctAnswer: string;
  note?: string;
  onCheck: () => void;
  onContinue: () => void;
}

export function ExerciseFooter({ checked, correct, canCheck, correctAnswer, note, onCheck, onContinue }: Props) {
  if (!checked) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={!canCheck}
        onPress={onCheck}
        style={[styles.button, { backgroundColor: canCheck ? Palette.green : '#AFAFAF' }]}>
        <ThemedText style={styles.buttonLabel}>Check</ThemedText>
      </Pressable>
    );
  }
  return (
    <View style={[styles.feedback, { backgroundColor: correct ? '#D7FFB8' : '#FFDFE0' }]}>
      <ThemedText type="smallBold" style={{ color: correct ? Palette.greenDark : Palette.redDark }}>
        {correct ? 'Ó dára! (Correct!)' : `Correct answer: ${correctAnswer}`}
      </ThemedText>
      {note ? (
        <ThemedText type="small" style={{ color: '#3C3C3C' }}>
          {note}
        </ThemedText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={onContinue}
        style={[styles.button, { backgroundColor: correct ? Palette.green : Palette.red }]}>
        <ThemedText style={styles.buttonLabel}>Continue</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  feedback: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
