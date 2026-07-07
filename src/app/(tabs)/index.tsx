import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { course, isLessonUnlocked } from '@/lib/content';
import { effectiveStreak } from '@/lib/streak';
import { levelForXp, useProfile } from '@/state/profile';

export default function LearnScreen() {
  const router = useRouter();
  const { xp, cowries, streak, completedLessons } = useProfile();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.statsRow}>
          <ThemedText type="smallBold">🔥 {effectiveStreak(streak)}</ThemedText>
          <ThemedText type="smallBold">🐚 {cowries}</ThemedText>
          <ThemedText type="smallBold">⭐ Lv {levelForXp(xp)}</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {xp} XP
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {course.units.map((unit) => (
            <View key={unit.id} style={styles.unit}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.unitTitle}>
                {unit.titleYo} · {unit.titleEn}
              </ThemedText>
              {unit.lessons.map((lesson) => {
                const done = completedLessons[lesson.id] === true;
                const unlocked = isLessonUnlocked(lesson.id, completedLessons);
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                    style={[
                      styles.lesson,
                      done && { borderColor: Palette.green, borderWidth: 2 },
                      !unlocked && { opacity: 0.4 },
                    ]}>
                    <ThemedView type="backgroundElement" style={styles.lessonInner}>
                      <ThemedText type="subtitle" style={styles.lessonEmoji}>
                        {done ? '✅' : unlocked ? '📖' : '🔒'}
                      </ThemedText>
                      <View style={styles.lessonText}>
                        <ThemedText type="smallBold">{lesson.titleYo}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {lesson.titleEn} · {lesson.xp} XP
                        </ThemedText>
                      </View>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
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
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  scroll: {
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  unit: {
    gap: Spacing.two,
  },
  unitTitle: {
    textTransform: 'uppercase',
  },
  lesson: {
    borderRadius: 18,
  },
  lessonInner: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  lessonEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  lessonText: {
    gap: Spacing.half,
  },
});
