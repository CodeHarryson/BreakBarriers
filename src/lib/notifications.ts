/**
 * Local reminder notifications (no push server needed):
 * - Streak reminder at 19:00 if today's XP goal is unmet.
 * - Practice reminder at 09:00 tomorrow if ≥5 SRS cards will be due.
 * Reschedules debounced on every profile change; skips silently without
 * permission. Permission itself is requested at the first lesson-complete
 * moment (see lesson/[id].tsx) — the emotional high point, not app launch.
 */
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { dateKey } from '@/lib/streak';
import { useProfile } from '@/state/profile';

const STREAK_ID = 'streak-reminder';
const PRACTICE_ID = 'practice-due';
const PRACTICE_MIN_DUE = 5;
const DEBOUNCE_MS = 10_000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function hasPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

function at(hour: number, daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export async function rescheduleReminders(): Promise<void> {
  if (!(await hasPermission())) return;
  const s = useProfile.getState();

  await Notifications.cancelScheduledNotificationAsync(STREAK_ID);
  await Notifications.cancelScheduledNotificationAsync(PRACTICE_ID);

  // Streak: next 19:00 where the goal could still be unmet.
  const goalMetToday = s.xpTodayDate === dateKey() && s.xpToday >= s.dailyGoalXp;
  const streakAt =
    !goalMetToday && Date.now() < at(19, 0).getTime() ? at(19, 0) : at(19, 1);
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_ID,
    content: {
      title: 'Iná rẹ! 🔥 Your streak!',
      body: `Ẹ̀kọ́ kan ṣoṣo — one quick lesson keeps your ${s.streak.current}-day streak alive.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: streakAt,
    },
  });

  // Practice: tomorrow 09:00 if enough cards will be due by then.
  const tomorrow9 = at(9, 1).getTime();
  const dueByThen = Object.values(s.srsDeck).filter(
    (card) => new Date(card.due).getTime() <= tomorrow9,
  ).length;
  if (dueByThen >= PRACTICE_MIN_DUE) {
    await Notifications.scheduleNotificationAsync({
      identifier: PRACTICE_ID,
      content: {
        title: 'Ìdánrawò ⏰ Practice time',
        body: `${dueByThen} words are ready for review — spacing is the magic.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(tomorrow9),
      },
    });
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Mount once (root layout): debounced reschedule on every profile change. */
export function useReminders(): void {
  useEffect(() => {
    void rescheduleReminders();
    const unsubscribe = useProfile.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void rescheduleReminders();
      }, DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
}
