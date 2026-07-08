import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FreeText } from '@/components/exercises/free-text';
import { MatchPairs } from '@/components/exercises/match-pairs';
import { Palette } from '@/components/exercises/exercise-footer';
import { SelectTranslation } from '@/components/exercises/select-translation';
import { ToneDrill } from '@/components/exercises/tone-drill';
import { WordBank } from '@/components/exercises/word-bank';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { getLesson } from '@/lib/content';
import { requestNotificationPermission } from '@/lib/notifications';
import { COWRIES_PER_LESSON, PERFECT_BONUS_COWRIES, useProfile } from '@/state/profile';
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
  const [wasPerfect, setWasPerfect] = useState(false);

  const entry = id ? getLesson(id) : undefined;
  const lessonKind = entry?.lesson.kind ?? 'lesson';

  useEffect(() => {
    if (id && entry) track('lesson_started', { lessonId: id, kind: lessonKind });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      const finalCorrect = correctCount + (correct ? 1 : 0);
      const perfect = finalCorrect === total;
      setWasPerfect(perfect);
      setCowriesEarned(
        (alreadyDone ? 2 : COWRIES_PER_LESSON) + (perfect ? PERFECT_BONUS_COWRIES : 0),
      );
      completeLesson(lesson.id, perfect);
      track('lesson_completed', {
        lessonId: lesson.id,
        kind: lessonKind,
        correct: finalCorrect,
        total,
        perfect,
      });
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // The celebration moment is the right time to ask for reminder permission.
      void requestNotificationPermission();
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
                {wasPerfect ? 'Pípé! Perfect lesson' : 'Kú iṣẹ́! Lesson complete'}
              </ThemedText>
            </Animated.View>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              {correctCount}/{total} correct · +{lesson.xp} XP · +{cowriesEarned} 🐚
              {wasPerfect ? ` (incl. +${PERFECT_BONUS_COWRIES} perfect bonus)` : ''}
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
    case 'free_text':
      return <FreeText exercise={exercise} onComplete={onComplete} />;
    case 'tone_drill':
      return <ToneDrill exercise={exercise} onComplete={onComplete} />;
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
