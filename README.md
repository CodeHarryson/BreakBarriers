# BreakBarriers

A Yoruba language-learning app built around **total immersion**: commit to an
immersion period, live in Yorùbá, and earn your heritage back — one streak at
a time. Modeled on Duolingo's core loop (streaks, XP, customizable avatars),
differentiated by Yoruba-first content (tones, diacritics, culture), FSRS
spaced repetition, and the Immersion Contract.

📚 **Docs:** [Product research](docs/PRODUCT_RESEARCH.md) · [Implementation plan](docs/IMPLEMENTATION_PLAN.md)

## Stack

- **App:** React Native + [Expo](https://expo.dev) (SDK 57), TypeScript, expo-router
- **State:** zustand, persisted offline-first via AsyncStorage
- **SRS:** [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (FSRS scheduler, same family as Anki's default)
- **Content:** versioned JSON course in [`content/`](content/), validated by `npm run validate:content`

## Getting started

```bash
npm install
npm start          # then press i (iOS simulator), a (Android), or w (web)
```

Useful scripts:

```bash
npm run typecheck         # tsc --noEmit
npm run validate:content  # lint the course JSON (schema, vocab refs, answers)
npm run lint              # eslint via expo
```

## Project layout

```
content/course.yo-en.json   # the course: vocab, units, lessons, exercises
src/app/                    # expo-router screens
  (tabs)/index.tsx          #   Learn — unit/lesson path
  (tabs)/practice.tsx       #   Practice — FSRS review queue
  (tabs)/profile.tsx        #   Profile — streak, cowries, avatar wardrobe
  lesson/[id].tsx           #   Lesson player (modal)
src/components/exercises/   # select-translation, word-bank, match-pairs
src/lib/                    # content loader, FSRS wrapper, streak engine
src/state/profile.ts        # persisted learner profile store
src/data/wardrobe.ts        # avatar wardrobe (cowrie economy)
scripts/validate-content.mjs
docs/                       # product research + implementation plan
```

## Status (Phase 1 skeleton)

Done: lesson engine (3 exercise types), course seed content (7 lessons,
32 vocab — **pending native-speaker review**), FSRS practice queue, Iná streak
with freezes, XP/levels, cowrie currency, avatar wardrobe with emoji
placeholder art.

Next (see the [implementation plan](docs/IMPLEMENTATION_PLAN.md)): native
audio recordings, Supabase auth + sync, push notifications, hearts decision,
then Phase 2's Immersion Contract and full Yorùbá UI locale.

> ⚠️ All Yorùbá strings in `content/` are seed data written for development
> and must be reviewed by a native speaker before any release.
