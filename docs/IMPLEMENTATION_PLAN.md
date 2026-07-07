# BreakBarriers — Implementation Plan

*Companion to [PRODUCT_RESEARCH.md](./PRODUCT_RESEARCH.md). Target: Yoruba, modeled on Duolingo's core loop, differentiated by the Immersion Contract.*

> **Scope amendments (July 2026):**
> 1. **Text-first MVP** — native-speaker audio recordings and content review are deferred past MVP; listening/speaking exercise types ship when they do. Content stays fully diacritized so audio can be layered on without rework.
> 2. **iOS only** for the MVP (Android and web later; the Expo codebase keeps both cheap to add).
> 3. **Prisma Postgres instead of Supabase** — a small Hono API in `server/` owns the Prisma client (React Native can't run Prisma directly). The app stays offline-first and pushes best-effort snapshots; identity is an anonymous device id until Sign in with Apple lands.

---

## 1. Product Definition

### Core loop (Duolingo-style)
```
Open app (streak pressure / Yoruba notification)
  → Daily goal: lesson(s) + SRS review queue
  → Earn XP + cowries → level up → unlock avatar wardrobe & units
  → Streak extends → return tomorrow
```

### Feature map — brief requirement → concrete feature

| Brief requirement | Feature |
|---|---|
| Total immersion, user-defined period | **Immersion Contract**: pick 7 / 14 / 30 / custom days. During the contract: app UI in Yorùbá (tap-and-hold any string for gloss), notifications in Yorùbá, daily minimum raised, big cowrie + exclusive-wardrobe payout on completion. Progressive: UI flips in stages by level so beginners aren't drowned. |
| Turn phone language to Yoruba | **Device Immersion Checklist** (can't be automated — OS restriction): guided steps to install the Gboard Yorùbá keyboard, add the streak/phrase-of-the-day widget, and (Android) switch system language. Each step earns cowries. |
| Only speak target language in the app | **Yorùbá-only inputs during immersion**: free-text exercises and community chat run a language check; English input is bounced with an in-Yorùbá nudge + hint button. Voice enforcement deferred to ASR phase. |
| Task-based learning | **Iṣẹ́ (Tasks)**: scenario missions — haggle at Balogun market, direct a taxi, greet elders at a family event, order àmàlà. Multi-step, problem-solving, graded on task completion not per-sentence perfection. |
| Translate target → native language | **Decode exercises**: Yorùbá→English translation items are a first-class exercise type throughout (builds comprehension before production). |
| Comprehensible Input | **Ìtàn (Stories)**: graded readers + native-speaker audio at i+1 (90–95% known vocab), unlocked per unit. Tap any word for gloss; taps feed the SRS deck. |
| Spaced repetition | **FSRS-scheduled review queue** ("Practice"), fed by lesson mistakes, story taps, and completed vocab. |
| Daily streak | **Iná (fire) streak** + streak freezes purchasable with cowries + streak-wager option (bet cowries you'll hold 14 days). |
| Customizable avatars, level rewards | **Avatar system**: base avatar at signup; levels unlock wardrobe tiers (aṣọ òkè, gèlè, agbádá, fìlà, coral beads…); cowries buy items within unlocked tiers; Immersion Contract completions grant exclusive items. |

### Exercise types (v1)
1. Select-the-translation (Yorùbá→EN and EN→Yorùbá)
2. Word-bank sentence assembly
3. Listen-and-select / listen-and-type (native audio)
4. **Tone-pair minimal-pair drill** (hear `ọkọ` vs `ọkọ̀`, pick meaning) — the Yoruba-specific differentiator
5. Match pairs (word ↔ image/translation)
6. Free-text translation (lenient diacritic grading: correct-without-marks = accepted with a "tone tip" shown)
7. Read-aloud with record & compare (self-assessed pitch/waveform overlay; ASR-graded later)
8. Task missions (branching multi-step scenarios composed of the above)

---

## 2. Technical Architecture

### Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| Mobile app | **React Native + Expo (TypeScript)** | One codebase for iOS/Android, OTA updates for fast iteration, strong ecosystem; Expo handles push, audio, widgets (via config plugins) |
| State/data | Zustand + TanStack Query; **SQLite (expo-sqlite) for offline-first** lesson content & SRS state | Lessons and reviews must work offline (diaspora users travel; Nigeria connectivity) |
| SRS | **`ts-fsrs`** (open-spaced-repetition) | Maintained FSRS implementation; runs on-device, syncs review logs |
| Backend | **Supabase** (Postgres, Auth, Storage, Edge Functions, Realtime) | Fastest path for a small team: auth, social sign-in, row-level security, file storage for audio, leaderboard queries |
| Content pipeline | Structured JSON course format in a separate `content/` package + validation CLI | Content is the moat; treat it as code (versioned, linted for missing diacritics/audio) |
| Audio | Recorded native-speaker clips (M4A/Opus), CDN via Supabase Storage | See research §5.3 — no TTS bet in MVP |
| Analytics | PostHog (self-serve, mobile SDKs) | Funnel + retention analysis from day one |
| Language check (immersion inputs) | On-device heuristic (wordlist + diacritic/character stats) first; server model later | Cheap, offline, good enough to bounce obvious English |

### Data model (core tables)

```
users(id, email, display_name, native_lang, created_at)
profiles(user_id, xp, level, cowries, current_streak, longest_streak,
         streak_freezes, last_active_date, avatar_config jsonb)
courses(id, lang_pair, version)
units(id, course_id, order, title_yo, title_en, cefr_band)
lessons(id, unit_id, order, type: lesson|story|task|checkpoint)
exercises(id, lesson_id, order, type, prompt jsonb, answers jsonb, audio_url)
vocab_items(id, course_id, lemma_yo, gloss_en, audio_url, tone_pattern, tags)
srs_cards(user_id, vocab_item_id, fsrs_state jsonb, due_at)   -- synced from device
review_logs(user_id, card_id, rating, reviewed_at)             -- feeds FSRS optimizer
immersion_contracts(id, user_id, start_date, end_date, status,
                    daily_minimum_xp, wagered_cowries, reward_tier)
avatar_items(id, name_yo, name_en, slot, tier, cost_cowries, unlock_level, asset_url)
user_avatar_items(user_id, item_id, acquired_via)
xp_events(user_id, amount, source, created_at)                 -- powers leagues later
```

### Immersion mode implementation
- All UI strings via i18n (e.g., `i18next`) with **full `yo` locale** — the app is its own first immersion artifact; ship it diacritic-perfect.
- `immersionLevel` (0–3) derived from active contract + learner level: 0 = English UI, 1 = navigation/chrome in Yorùbá, 2 = all UI in Yorùbá with tap-gloss, 3 = + notifications & Yorùbá-only inputs.
- Tap-and-hold gloss overlay component wraps every translated string; glossed words can be added to the SRS deck (immersion feeds learning).

---

## 3. Content Plan (start this first — longest lead time)

- **Scope for MVP:** Units 1–6 (~300 vocab items, ~60 lessons, 6 stories, 3 task missions): greetings & respect registers, self/family, numbers & money, food & market, directions/transport, everyday verbs. Explicit **tone & alphabet onboarding unit** (the "Sounds of Yorùbá" unit) before Unit 1.
- **Team:** 1 curriculum lead (Yoruba linguist/teacher), 1–2 native voice talents (one male, one female), you as content engineer.
- **Rules:** every string fully diacritized and speaker-reviewed; every vocab item and sentence has native audio; every item tagged with tone pattern; Standard Yorùbá with dialect notes where relevant.
- **Tooling before volume:** a content CLI that validates the JSON schema, flags missing diacritics (undotted ẹ/ọ/ṣ candidates), missing audio, and vocab not yet introduced (enforces i+1 in stories).

---

## 4. Build Roadmap

### Phase 0 — Foundations (2–3 weeks)
- Repo setup: Expo app, Supabase project, CI (EAS Build + GitHub Actions), content package + validator CLI.
- Design system: colors/type inspired by àdìrẹ/aṣọ òkè patterns; avatar art direction; commission first wardrobe set.
- Write "Sounds of Yorùbá" + Units 1–2 content; record audio.
- **Exit criteria:** content pipeline renders a lesson JSON into a playable exercise sequence in the app shell.

### Phase 1 — MVP core loop (4–6 weeks)
- Auth + onboarding (motivation quiz → recommends a future Immersion Contract length; avatar creation).
- Lesson engine: exercise types 1–5, hearts/energy, XP, cowries, levels.
- FSRS practice queue (ts-fsrs, on-device, synced).
- Streak system + freezes + local notifications.
- Avatar screen: equip/purchase items.
- Units 1–3 live.
- **Exit criteria:** a new user can do a full daily loop offline; D1 retention measurable in PostHog. Internal TestFlight/Play beta.

### Phase 2 — Immersion & tasks (4–6 weeks) — the differentiator release
- Full `yo` UI locale + tap-gloss overlay + progressive immersion levels.
- Immersion Contract: setup flow, daily tracking, pause/break rules, completion rewards, optional cowrie wager.
- Device Immersion Checklist (keyboard install, widget, Android system-language guide).
- Yorùbá-only text-input enforcement (heuristic checker) + free-text translation exercises with lenient diacritic grading.
- Task missions ×3 + Stories ×6; home-screen streak/phrase widget.
- **Exit criteria:** closed beta with 50–100 heritage learners (recruit via diaspora orgs, TikTok/IG Yoruba-learning creators); measure contract completion rate and D14 retention.

### Phase 3 — Retention & social (4–6 weeks)
- Streak wager; friends + friend streaks; weekly cowrie chest.
- Leagues (weekly XP leaderboards, bronze→diamond) once DAU supports cohorts of ~30.
- Read-aloud record-and-compare exercises; expanded wardrobe drops (seasonal: Ọdún Ìbílẹ̀ festivals).
- Units 7–10.
- **Exit criteria:** D14 > 20%, contract completion > 40%; public launch on both stores.

### Phase 4 — Monetization & speech (ongoing)
- Premium subscription (unlimited hearts, offline packs, streak insurance, exclusive wardrobe) + Immersion Intensive paid programs.
- Yoruba ASR pilot (fine-tuned MMS/Whisper on YorùLect-style data) for graded speaking and voice-based Yorùbá-only enforcement.
- FSRS parameter optimization from accumulated review logs; A/B testing framework.
- Explore: Igbo/Twi/Swahili as follow-on courses on the same engine ("BreakBarriers" = African languages platform).

---

## 5. Success Metrics

| Metric | MVP target | Phase 3 target |
|---|---|---|
| D1 / D7 / D14 retention | 40% / 20% / 12% | 55% / 30% / 20% |
| Immersion Contract completion | — | > 40% |
| Median daily session | 8 min | 10 min |
| SRS review adherence (due cards cleared) | 50% | 65% |
| Beta NPS (heritage segment) | > 30 | > 50 |

## 6. Open Product Decisions (revisit at Phase 1 kickoff)

1. Hearts/energy vs. unlimited free practice (hearts drive monetization but add friction for a niche language — consider launching without them).
2. Avatar art style (2D illustrated vs. Duolingo-flat vs. 3D) — cost vs. charm tradeoff; drives wardrobe production cost per item.
3. Community features scope (chat is powerful for immersion enforcement but adds moderation burden).
4. Whether the Immersion Contract should hard-lock (can't reduce level until done) or soft-pause — test both in beta.
