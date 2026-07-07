import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchPairs } from '@/components/exercises/match-pairs';
import { Palette } from '@/components/exercises/exercise-footer';
import { SelectTranslation } from '@/components/exercises/select-translation';
import { WordBank } from '@/components/exercises/word-bank';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getLesson } from '@/lib/content';
import { COWRIES_PER_LESSON, useProfile } from '@/state/profile';
import type { Exercise } from '@/types/content';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const completeLesson = useProfile((s) => s.completeLesson);
  const alreadyDone = useProfile((s) => s.completedLessons[id ?? ''] === true);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  // Captured at completion time: the store flips completedLessons before the
  // summary renders, so reading `alreadyDone` there would show the repeat reward.
  const [cowriesEarned, setCowriesEarned] = useState(COWRIES_PER_LESSON);

  const entry = id ? getLesson(id) : undefined;
  if (!entry) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Lesson not found.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }
  const { lesson } = entry;
  const total = lesson.exercises.length;

  const onExerciseComplete = (correct: boolean) => {
    if (correct) setCorrectCount((c) => c + 1);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setCowriesEarned(alreadyDone ? 2 : COWRIES_PER_LESSON);
      completeLesson(lesson.id);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setFinished(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {finished ? (
          <View style={styles.summary}>
            <Animated.View entering={ZoomIn.springify().duration(500)}>
              <ThemedText style={styles.bigEmoji}>🎉</ThemedText>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(150).duration(300)}>
              <ThemedText type="subtitle" style={styles.centered}>
                Kú iṣẹ́! Lesson complete
              </ThemedText>
            </Animated.View>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              {correctCount}/{total} correct · +{lesson.xp} XP · +{cowriesEarned} 🐚
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={[styles.finishButton, { backgroundColor: Palette.green }]}>
              <ThemedText style={styles.finishLabel}>Continue</ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.topBar}>
              <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
                <ThemedText type="subtitle" themeColor="textSecondary">
                  ✕
                </ThemedText>
              </Pressable>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round((index / total) * 100)}%` },
                  ]}
                />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {index + 1}/{total}
              </ThemedText>
            </View>
            <ExerciseSwitch
              key={index}
              exercise={lesson.exercises[index]}
              onComplete={onExerciseComplete}
            />
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ExerciseSwitch({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete: (correct: boolean) => void;
}) {
  switch (exercise.type) {
    case 'select_translation':
      return <SelectTranslation exercise={exercise} onComplete={onComplete} />;
    case 'word_bank':
      return <WordBank exercise={exercise} onComplete={onComplete} />;
    case 'match_pairs':
      return <MatchPairs exercise={exercise} onComplete={onComplete} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E1E6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Palette.green,
  },
  summary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  bigEmoji: {
    fontSize: 64,
    lineHeight: 76,
  },
  centered: {
    textAlign: 'center',
  },
  finishButton: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    marginTop: Spacing.three,
  },
  finishLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});
