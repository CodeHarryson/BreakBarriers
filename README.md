# Asa mi

A Yoruba language-learning app built around **total immersion**: commit to an
immersion period, live in Yorùbá, and earn your heritage back — one streak at
a time. Modeled on Duolingo's core loop (streaks, XP, customizable avatars),
differentiated by Yoruba-first content (tones, diacritics, culture), FSRS
spaced repetition, and the Immersion Contract.

📚 **Docs:** [Product research](docs/PRODUCT_RESEARCH.md) · [Implementation plan](docs/IMPLEMENTATION_PLAN.md)

## Stack

- **App:** React Native + [Expo](https://expo.dev) (SDK 57), TypeScript, expo-router — **iOS-first** (Android/web later)
- **State:** zustand, persisted offline-first via AsyncStorage
- **SRS:** [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (FSRS scheduler, same family as Anki's default)
- **Backend:** [`server/`](server/) — Hono API + Prisma 7 on Prisma Postgres, deployed at `https://breakbarriers-api.vercel.app/api` (Vercel function via root [`api/`](api/); Docker/Fly config kept as an alternative). The app pushes best-effort profile snapshots and review logs (device is source of truth). Deploy: `npx vercel build --prod && npx vercel deploy --prebuilt --prod` (prebuilt avoids remote-build bundling issues with the nested server package).
- **Content:** versioned JSON course in [`content/`](content/), validated by `npm run validate:content`

## Getting started

```bash
npm install
cp .env.example .env   # points the app at the local sync server
npm start              # then press i (iOS simulator)

# in a second terminal — the sync API (needs server/.env with DATABASE_URL):
cd server && npm install && npm run dev
```

The app works fully offline; the server only powers cloud backup/restore.

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
src/lib/sync.ts             # debounced push sync to the API
scripts/validate-content.mjs
server/                     # Hono + Prisma sync API (Prisma Postgres)
docs/                       # product research + implementation plan
```

## MVP scope decisions

- **Text-first:** native-speaker audio and content review are deferred past MVP
  (listening/speaking exercises land with them).
- **iOS only** for now.
- **Anonymous device identity:** sync keys off a generated device id; Sign in
  with Apple replaces it post-MVP.

## Status (Phase 1)

Done: lesson engine (3 exercise types), course seed content (7 lessons,
32 vocab), FSRS practice queue, Iná streak with freezes, XP/levels, cowrie
currency, avatar wardrobe with emoji placeholder art, Prisma-backed cloud
sync (push + restore endpoints).

Next (see the [implementation plan](docs/IMPLEMENTATION_PLAN.md)): restore-on-
reinstall flow, streak notifications, onboarding, TestFlight build, then
Phase 2's Immersion Contract and full Yorùbá UI locale.

> ⚠️ Yorùbá strings in `content/` are unreviewed seed data — good enough to
> build against, but get a native-speaker pass before public release.
