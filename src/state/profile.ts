/**
 * Learner profile: XP, cowries, streak, SRS deck, lesson progress, avatar.
 * Persisted locally (offline-first). All mutations live in store actions so
 * the sync layer (src/lib/sync.ts) can piggyback on subscribe().
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getLesson } from '@/lib/content';
import {
  dueCards,
  newCard,
  Rating,
  reviewCard,
  type ReviewLogEntry,
  type StoredCard,
} from '@/lib/srs';
import { applyActivity, dateKey, initialStreak, type StreakState } from '@/lib/streak';
import { defaultAvatar, WARDROBE, type AvatarConfig } from '@/data/wardrobe';

export const COWRIES_PER_LESSON = 10;
export const XP_PER_LEVEL = 150;
export const XP_PER_REVIEW = 2;
export const DEFAULT_DAILY_GOAL_XP = 20;
export const FREEZE_COST_COWRIES = 25;
export const MAX_FREEZES = 2;
export const PERFECT_BONUS_COWRIES = 5;
/** Escalating daily login chest across a Mon–Sun week. */
export const CHEST_REWARDS = [3, 4, 5, 6, 8, 10, 15] as const;

/** Monday date key of the week containing `today` (chest reset boundary). */
export function weekKey(today: string = dateKey()): string {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - dow);
  return dateKey(date);
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Snapshot shape returned by GET /learners/:deviceId (server/). */
export interface RemoteProfile {
  xp: number;
  cowries: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
  avatar: AvatarConfig | null;
  ownedItems: string[] | null;
  completedLessons: Record<string, true> | null;
  srsDeck: Record<string, StoredCard> | null;
}

interface ProfileState {
  xp: number;
  cowries: number;
  streak: StreakState;
  completedLessons: Record<string, true>;
  srsDeck: Record<string, StoredCard>;
  reviewLog: ReviewLogEntry[];
  avatar: AvatarConfig;
  ownedItems: string[];
  onboarded: boolean;
  motivation: string | null;
  dailyGoalXp: number;
  xpToday: number;
  xpTodayDate: string;
  chestLastClaim: string | null;
  chestWeekKey: string;
  chestDayIndex: number;
  themeOverride: 'system' | 'light' | 'dark';

  completeLesson: (lessonId: string, perfect?: boolean) => void;
  claimChest: () => number | null;
  reviewVocab: (vocabId: string, rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) => void;
  buyItem: (itemId: string) => boolean;
  buyStreakFreeze: () => boolean;
  equipItem: (itemId: string | null, slot: keyof Omit<AvatarConfig, 'base'>) => void;
  setAvatarBase: (base: string) => void;
  completeOnboarding: (motivation: string | null, base: string) => void;
  restoreFromRemote: (remote: RemoteProfile) => void;
  setThemeOverride: (v: 'system' | 'light' | 'dark') => void;
  dueVocabIds: () => string[];
  todayXp: () => number;
}

/** Fold `amount` XP into total + today counters (today resets at local midnight). */
function xpGain(s: Pick<ProfileState, 'xp' | 'xpToday' | 'xpTodayDate'>, amount: number) {
  const today = dateKey();
  return {
    xp: s.xp + amount,
    xpToday: (s.xpTodayDate === today ? s.xpToday : 0) + amount,
    xpTodayDate: today,
  };
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      xp: 0,
      cowries: 0,
      streak: initialStreak,
      completedLessons: {},
      srsDeck: {},
      reviewLog: [],
      avatar: defaultAvatar,
      ownedItems: ['buba-basic'],
      onboarded: false,
      motivation: null,
      dailyGoalXp: DEFAULT_DAILY_GOAL_XP,
      xpToday: 0,
      xpTodayDate: dateKey(),
      chestLastClaim: null,
      chestWeekKey: weekKey(),
      chestDayIndex: 0,
      themeOverride: 'system',

      completeLesson: (lessonId, perfect = false) => {
        const entry = getLesson(lessonId);
        if (!entry) return;
        const { lesson } = entry;
        set((s) => {
          const firstCompletion = !s.completedLessons[lessonId];
          const deck = { ...s.srsDeck };
          for (const vocabId of lesson.vocabIds) {
            if (!deck[vocabId]) deck[vocabId] = newCard();
          }
          return {
            ...xpGain(s, lesson.xp),
            cowries:
              s.cowries +
              (firstCompletion ? COWRIES_PER_LESSON : 2) +
              (perfect ? PERFECT_BONUS_COWRIES : 0),
            streak: applyActivity(s.streak, dateKey()),
            completedLessons: { ...s.completedLessons, [lessonId]: true },
            srsDeck: deck,
          };
        });
      },

      claimChest: () => {
        const s = get();
        const today = dateKey();
        if (s.chestLastClaim === today) return null;
        const wk = weekKey(today);
        const dayIndex = s.chestWeekKey === wk ? s.chestDayIndex : 0;
        const reward = CHEST_REWARDS[Math.min(dayIndex, CHEST_REWARDS.length - 1)];
        set({
          cowries: s.cowries + reward,
          chestLastClaim: today,
          chestWeekKey: wk,
          chestDayIndex: dayIndex + 1,
        });
        return reward;
      },

      reviewVocab: (vocabId, rating) => {
        set((s) => {
          const card = s.srsDeck[vocabId];
          if (!card) return s;
          return {
            ...xpGain(s, XP_PER_REVIEW),
            srsDeck: { ...s.srsDeck, [vocabId]: reviewCard(card, rating) },
            reviewLog: [
              ...s.reviewLog,
              { vocabId, rating, reviewedAt: new Date().toISOString() },
            ].slice(-1000),
            streak: applyActivity(s.streak, dateKey()),
          };
        });
      },

      buyItem: (itemId) => {
        const item = WARDROBE.find((w) => w.id === itemId);
        const s = get();
        if (!item || s.ownedItems.includes(itemId)) return false;
        if (s.cowries < item.costCowries) return false;
        if (levelForXp(s.xp) < item.unlockLevel) return false;
        set({ cowries: s.cowries - item.costCowries, ownedItems: [...s.ownedItems, itemId] });
        return true;
      },

      buyStreakFreeze: () => {
        const s = get();
        if (s.cowries < FREEZE_COST_COWRIES || s.streak.freezes >= MAX_FREEZES) return false;
        set({
          cowries: s.cowries - FREEZE_COST_COWRIES,
          streak: { ...s.streak, freezes: s.streak.freezes + 1 },
        });
        return true;
      },

      equipItem: (itemId, slot) => {
        set((s) => ({ avatar: { ...s.avatar, [slot]: itemId ?? undefined } }));
      },

      setAvatarBase: (base) => set((s) => ({ avatar: { ...s.avatar, base } })),

      completeOnboarding: (motivation, base) =>
        set((s) => ({ onboarded: true, motivation, avatar: { ...s.avatar, base } })),

      restoreFromRemote: (remote) =>
        set(() => ({
          xp: remote.xp,
          cowries: remote.cowries,
          streak: {
            current: remote.currentStreak,
            longest: remote.longestStreak,
            freezes: remote.streakFreezes,
            lastActiveDate: remote.lastActiveDate,
          },
          avatar: remote.avatar ?? defaultAvatar,
          ownedItems: remote.ownedItems ?? ['buba-basic'],
          completedLessons: remote.completedLessons ?? {},
          srsDeck: remote.srsDeck ?? {},
          onboarded: true,
        })),

      setThemeOverride: (v) => set({ themeOverride: v }),

      dueVocabIds: () => dueCards(get().srsDeck),

      todayXp: () => {
        const s = get();
        return s.xpTodayDate === dateKey() ? s.xpToday : 0;
      },
    }),
    {
      name: 'breakbarriers-profile-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
