import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { getVocab } from '@/lib/content';
import { Rating } from '@/lib/srs';
import { useProfile } from '@/state/profile';

const GRADES = [
  { rating: Rating.Again, label: 'Again', color: Palette.red },
  { rating: Rating.Hard, label: 'Hard', color: Palette.amber },
  { rating: Rating.Good, label: 'Good', color: Palette.green },
  { rating: Rating.Easy, label: 'Easy', color: Palette.indigo },
] as const;

export default function PracticeScreen() {
  const { reviewVocab, dueVocabIds, srsDeck } = useProfile();
  const [revealed, setRevealed] = useState(false);

  const due = dueVocabIds();
  const currentId = due[0];
  const vocab = currentId ? getVocab(currentId) : undefined;
  const deckSize = Object.keys(srsDeck).length;

  const grade = (rating: (typeof GRADES)[number]['rating']) => {
    if (!currentId) return;
    const streakBefore = useProfile.getState().streak.current;
    reviewVocab(currentId, rating);
    const streakAfter = useProfile.getState().streak.current;
    track('review_completed', { rating });
    // Only when today's first activity actually bumped the streak (not same-day repeats or resets).
    if (streakAfter > streakBefore) track('streak_extended', { current: streakAfter });
    setRevealed(false);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.header}>
          Ìdánrawò · Practice — {due.length} due / {deckSize} learned
        </ThemedText>

        {!vocab ? (
          <View style={styles.empty}>
            <ThemedText type="subtitle" style={styles.centered}>
              {deckSize === 0 ? 'Complete a lesson to start your deck' : 'Gbogbo ẹ ti tán! 🎉'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              {deckSize === 0
                ? 'New words are added to review automatically.'
                : 'All reviews done. Come back later — spacing is the point!'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.card}>
            <ThemedView type="backgroundElement" style={styles.cardFace}>
              <ThemedText type="title" style={styles.centered}>
                {vocab.yo}
              </ThemedText>
              {revealed && (
                <>
                  <ThemedText type="subtitle" themeColor="textSecondary" style={styles.centered}>
                    {vocab.en}
                  </ThemedText>
                  {vocab.tonePattern ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Tone: {vocab.tonePattern.split('').join('–')}
                    </ThemedText>
                  ) : null}
                </>
              )}
            </ThemedView>

            {!revealed ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setRevealed(true)}
                style={[styles.button, { backgroundColor: Palette.indigo }]}>
                <ThemedText style={styles.buttonLabel}>Show answer</ThemedText>
              </Pressable>
            ) : (
              <View style={styles.gradeRow}>
                {GRADES.map((g) => (
                  <Pressable
                    accessibilityRole="button"
                    key={g.label}
                    onPress={() => grade(g.rating)}
                    style={[styles.button, styles.gradeButton, { backgroundColor: g.color }]}>
                    <ThemedText style={styles.buttonLabel}>{g.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
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
    paddingBottom: BottomTabInset + Spacing.three,
  },
  header: {
    paddingVertical: Spacing.three,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  cardFace: {
    borderRadius: 24,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 260,
    justifyContent: 'center',
  },
  button: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gradeButton: {
    flex: 1,
  },
});
