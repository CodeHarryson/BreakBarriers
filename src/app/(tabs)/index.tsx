import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/exercises/exercise-footer';
import { GoalRing } from '@/components/goal-ring';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { course, isLessonUnlocked } from '@/lib/content';
import { dateKey, effectiveStreak } from '@/lib/streak';
import { CHEST_REWARDS, levelForXp, useProfile, weekKey } from '@/state/profile';

export default function LearnScreen() {
  const router = useRouter();
  const {
    xp,
    cowries,
    streak,
    completedLessons,
    onboarded,
    dailyGoalXp,
    xpToday,
    xpTodayDate,
    chestLastClaim,
    chestWeekKey,
    chestDayIndex,
    claimChest,
  } = useProfile();
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  if (!onboarded) return <Redirect href="/onboarding" />;

  const earnedToday = xpTodayDate === dateKey() ? xpToday : 0;
  const chestAvailable = chestLastClaim !== dateKey();
  const chestDay = chestWeekKey === weekKey() ? chestDayIndex : 0;
  const chestReward = CHEST_REWARDS[Math.min(chestDay, CHEST_REWARDS.length - 1)];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.statsRow}>
          <GoalRing earned={earnedToday} goal={dailyGoalXp} size={56} />
          <View style={styles.statsCol}>
            <View style={styles.statsInner}>
              <ThemedText type="smallBold" accessibilityLabel={`${effectiveStreak(streak)} day streak`}>
                🔥 {effectiveStreak(streak)}
              </ThemedText>
              <ThemedText type="smallBold" accessibilityLabel={`${cowries} cowries`}>
                🐚 {cowries}
              </ThemedText>
              <ThemedText type="smallBold" accessibilityLabel={`Level ${levelForXp(xp)}`}>
                ⭐ Lv {levelForXp(xp)}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {earnedToday >= dailyGoalXp
                ? 'Ibi-àfẹ́dé ti parí — goal met! 🎉'
                : `${earnedToday}/${dailyGoalXp} XP today`}
            </ThemedText>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {(chestAvailable || justClaimed !== null) && (
            <Card
              onPress={() => {
                const reward = claimChest();
                setJustClaimed(reward);
                if (reward !== null) track('chest_claimed', { day: chestDay + 1, reward });
              }}
              disabled={!chestAvailable}
              accentColor={justClaimed !== null ? Palette.amber : undefined}>
              {justClaimed !== null ? (
                <Animated.View entering={FadeIn.duration(250)} style={styles.chestInner}>
                  <ThemedText style={styles.chestEmoji}>✨</ThemedText>
                  <View>
                    <ThemedText type="smallBold">+{justClaimed} 🐚 collected!</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Day {Math.min(chestDayIndex, CHEST_REWARDS.length)} of 7 — bigger every day
                    </ThemedText>
                  </View>
                </Animated.View>
              ) : (
                <View style={styles.chestInner}>
                  <ThemedText style={styles.chestEmoji}>🎁</ThemedText>
                  <View>
                    <ThemedText type="smallBold">Daily chest · +{chestReward} 🐚</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Day {chestDay + 1} of 7 — tap to open
                    </ThemedText>
                  </View>
                </View>
              )}
            </Card>
          )}
          {course.units.map((unit) => (
            <View key={unit.id} style={styles.unit}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.unitTitle}>
                {unit.titleYo} · {unit.titleEn}
              </ThemedText>
              {unit.lessons.map((lesson) => {
                const done = completedLessons[lesson.id] === true;
                const unlocked = isLessonUnlocked(lesson.id, completedLessons);
                const isCheckpoint = lesson.kind === 'checkpoint';
                return (
                  <Card
                    accessibilityLabel={`${isCheckpoint ? 'Checkpoint: ' : ''}${lesson.titleYo}, ${lesson.titleEn}. ${lesson.xp} XP. ${
                      done ? 'Completed' : !unlocked ? 'Locked' : 'Not started'
                    }`}
                    accessibilityState={{ disabled: !unlocked }}
                    key={lesson.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                    accentColor={
                      done ? Palette.green : isCheckpoint && !done && unlocked ? Palette.amber : undefined
                    }
                    style={!unlocked && { opacity: 0.4 }}>
                    <View style={styles.lessonInner}>
                      <ThemedText type="subtitle" style={styles.lessonEmoji}>
                        {done ? '✅' : !unlocked ? '🔒' : isCheckpoint ? '🏆' : '📖'}
                      </ThemedText>
                      <View style={styles.lessonText}>
                        <ThemedText type="smallBold">
                          {isCheckpoint ? `${lesson.titleYo} (Checkpoint)` : lesson.titleYo}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {lesson.titleEn} · {lesson.xp} XP
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
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
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  statsCol: {
    flex: 1,
    gap: Spacing.one,
  },
  statsInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scroll: {
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  chestInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  chestEmoji: {
    fontSize: 28,
    lineHeight: 36,
  },
  unit: {
    gap: Spacing.two,
  },
  unitTitle: {
    textTransform: 'uppercase',
  },
  lessonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  lessonEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  lessonText: {
    gap: Spacing.half,
  },
});
