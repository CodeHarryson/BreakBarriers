import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

function feedbackHaptic(correct: boolean) {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(
    correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  );
}

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
        onPress={() => {
          feedbackHaptic(correct);
          onCheck();
        }}
        style={[styles.button, { backgroundColor: canCheck ? Palette.green : '#AFAFAF' }]}>
        <ThemedText style={styles.buttonLabel}>Check</ThemedText>
      </Pressable>
    );
  }
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[styles.feedback, { backgroundColor: correct ? '#D7FFB8' : '#FFDFE0' }]}>
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
    </Animated.View>
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
