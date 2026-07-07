/**
 * Learner profile: XP, cowries, streak, SRS deck, lesson progress, avatar.
 * Persisted locally (offline-first). Supabase sync arrives with auth in a
 * later Phase 1 step — keep all mutations inside store actions so the sync
 * layer can hook them.
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

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
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

  completeLesson: (lessonId: string) => void;
  reviewVocab: (vocabId: string, rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) => void;
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string | null, slot: keyof Omit<AvatarConfig, 'base'>) => void;
  setAvatarBase: (base: string) => void;
  dueVocabIds: () => string[];
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

      completeLesson: (lessonId) => {
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
            xp: s.xp + lesson.xp,
            cowries: s.cowries + (firstCompletion ? COWRIES_PER_LESSON : 2),
            streak: applyActivity(s.streak, dateKey()),
            completedLessons: { ...s.completedLessons, [lessonId]: true },
            srsDeck: deck,
          };
        });
      },

      reviewVocab: (vocabId, rating) => {
        set((s) => {
          const card = s.srsDeck[vocabId];
          if (!card) return s;
          return {
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

      equipItem: (itemId, slot) => {
        set((s) => ({ avatar: { ...s.avatar, [slot]: itemId ?? undefined } }));
      },

      setAvatarBase: (base) => set((s) => ({ avatar: { ...s.avatar, base } })),

      dueVocabIds: () => dueCards(get().srsDeck),
    }),
    {
      name: 'breakbarriers-profile-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
