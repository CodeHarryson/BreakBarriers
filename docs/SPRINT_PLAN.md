# Asa mi — Sprint Plan

*Created July 6, 2026. Companion to [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md); this is the execution schedule.*

---

## 1. How we work

| | |
|---|---|
| **Team** | Harry (product owner / decisions / accounts / outreach) + Claude Code (engineering) |
| **Cadence** | 1-week sprints, Monday → Friday. Solo-founder pace: short sprints keep scope honest. |
| **Ceremonies** | **Mon:** pick the sprint goal + backlog from this doc. **Fri:** demo build to yourself on device, mark items done/slipped, pull the diff forward. |
| **Estimation** | Points (1 / 2 / 3 / 5 / 8). Budget ≈ **20 pts/sprint**. Anything estimated 8 gets split before it enters a sprint. |
| **Definition of Done** | Typecheck + `validate:content` + lint clean · runs on the iOS simulator · state survives app restart · README/docs updated if behavior changed · committed |
| **Board** | This file is the board. Statuses: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked. |

**Labels:** 🔑 = only Harry can do it (account, decision, outreach, purchase). Items without 🔑 are engineering.

## 2. Milestones

| Milestone | Target | Definition |
|---|---|---|
| **M1 — Device build** | end of Sprint 2 (Jul 17) | Full core loop runs on your physical iPhone; daily-use ready |
| **M2 — TestFlight** | end of Sprint 4 (Jul 31) | Installable by external testers; analytics + crash reporting live |
| **M3 — Immersion beta** | end of Sprint 8 (Aug 28) | Immersion Contract shipped; 25–50 heritage-learner beta testers active |
| **M4 — App Store launch** | end of Sprint 10 (Sep 11) | Approved, public, with launch content (Units 1–6) |

Velocity check: if two sprints in a row close under 70%, cut scope from M3 (drop task missions to 1, ship stories post-launch) rather than slipping M4.

---

## 3. Sprint 0 — Foundations ✅ (done, week of Jul 6)

Shipped ahead of schedule, all committed:

- [x] Product research + implementation plan (`docs/`)
- [x] Expo SDK 57 scaffold, TypeScript, expo-router, iOS-first
- [x] Content pipeline: course JSON schema, validator, seed content (3 units / 7 lessons / 32 vocab, diacritized)
- [x] Lesson engine: select-translation, word-bank, match-pairs + lesson player with progress/feedback
- [x] FSRS practice queue (ts-fsrs), review logging
- [x] Iná streak engine (freezes), XP/levels, cowrie economy
- [x] Avatar + wardrobe (emoji placeholders), buy/equip
- [x] Prisma Postgres backend (`server/`): schema pushed, sync + restore endpoints, round-trip tested
- [x] App-side debounced push sync, anonymous device id

---

## 4. Sprint 1 — "Runs on my iPhone" (Mon Jul 6 → Fri Jul 10) · 20 pts

**Goal:** the core loop is something Harry uses daily on his own phone.

| Status | Pts | Item | Acceptance criteria |
|---|---|---|---|
| [x] | 🔑 2 | Install Xcode + iOS simulator runtime | `npm start` → `i` boots the app ✓ (Xcode 26.6, iPhone 17 Pro sim) |
| [x] | 🔑 1 | Decide: hearts/energy or unlimited practice | **Unlimited, no hearts** — recorded in IMPLEMENTATION_PLAN §6 |
| [x] | 3 | Onboarding flow (first launch): welcome → why-Yorùbá motivation pick → avatar base pick → straight into `tones-1` | New install lands in first lesson in <60s; skippable |
| [x] | 3 | Restore-on-reinstall: if local profile is empty and server has one for this device id, offer restore | Restore offer on onboarding welcome (5s timeout, silent offline) |
| [x] | 3 | Empty/error states pass: practice empty state, lesson-not-found, sync-off mode | No dead ends; airplane mode never blocks the loop |
| [x] | 3 | Daily goal ring on Learn tab (XP target/day, default 20) + "goal met" moment | Ring fills; resets at local midnight |
| [x] | 2 | Streak-freeze purchase UI on profile (cowries → 🧊, max 2) | Buy decrements cowries; freeze auto-consumes on a missed day |
| [x] | 3 | Haptics + micro-animations on answer check and lesson complete | Success/error haptics; feedback slide-in; summary zoom celebration |

**Slack risk:** Xcode download is slow — start it Monday morning.

## 5. Sprint 2 — Retention plumbing → **M1** (Jul 13 → Jul 17) · 20 pts

**Goal:** the app pulls you back tomorrow.

| Status | Pts | Item | Acceptance criteria |
|---|---|---|---|
| [x] | 🔑 2 | Create Expo account, `eas init`, iOS credentials | Logged in as codeharry; project @codeharry/breakbarriers linked; simulator build FINISHED, installed, connects to Metro |
| [x] | 🔑 3 | Enroll in Apple Developer Program | Active (user already enrolled) |
| [x] | 3 | Local streak-reminder notifications (evening, only if today's goal unmet), Yorùbá+English copy | Next 19:00 slot; reschedules on profile changes; permission asked at first lesson-complete |
| [x] | 3 | Practice-due notification (morning, only if ≥5 cards due) | 09:00 next day; skips below threshold; silent without permission |
| [~] | 3 | Development build on physical iPhone (dev client) | Simulator build verified; device build needs `eas device:create` + `eas build --profile development` (interactive Apple sign-in) |
| [x] | 2 | Deploy `server/` + point `EXPO_PUBLIC_API_URL` at it | **Live on Vercel (free)**: breakbarriers-api.vercel.app/api — round-trip verified; Fly config kept as fallback |
| [x] | 2 | Weekly cowrie chest (escalating 3→15 🐚 across Mon–Sun, resets weekly) | Chest card on Learn; state survives restart |
| [x] | 2 | Perfect-lesson bonus (+5 🐚 for 100%) with celebration | "Pípé!" summary variant, bonus itemized |

## 6. Sprint 3 — Content depth (Jul 20 → Jul 24) · 21 pts ✅ (done early, Jul 7)

**Goal:** enough course to survive a motivated learner's first two weeks.

| Status | Pts | Item | Acceptance criteria |
|---|---|---|---|
| [x] | 5 | Unit 3 "Oúnjẹ àti Ọjà" (food & market) + Unit 4 "Àwọn Ìbéèrè" (questions): 12 new lessons (incl. checkpoints), 43 new vocab (75 total) | Validator clean; i+1 ordering enforced (0 violations) |
| [x] | 3 | Free-text translation with **lenient diacritic grading** (accept unmarked input, show tone tip) | Grading lib tested: undiacritized input accepted with a tone-tip nudge |
| [x] | 3 | **Visual tone drill** (pitch-contour graphic, no audio) | Dot height per syllable maps to L/M/H |
| [x] | 3 | In-app Yorùbá character bar (ẹ ọ ṣ gb + combining tone marks) | Shown in en->yo free-text exercises |
| [x] | 2 | Checkpoint quizzes at unit end (mixed review, 2× XP, 🏆) | Checkpoints for Units 1–4; gate next unit via sequential unlock |
| [x] | 3 | Content tooling: `validate:content` checks i+1 ordering + duplicate-vocab reuse | Enforced; new exercise types validated |
| [x] | 2 | GitHub Actions CI: typecheck + validate + lint (app) + prisma/typecheck (server) | `.github/workflows/ci.yml`; all steps pass locally |

## 7. Sprint 4 — TestFlight → **M2** (Jul 27 → Jul 31) · 19 pts

**Goal:** strangers can install it; we can see what they do and where it crashes.

| Status | Pts | Item | Acceptance criteria |
|---|---|---|---|
| [!] | 🔑 2 | App Store Connect app record, TestFlight internal group | Build visible in TestFlight |
| [!] | 🔑 2 | Decide avatar art direction + commission per [AVATAR_SPEC.md](./AVATAR_SPEC.md) (layered 2D: free identity layers — 8 skins/10 hair —, paid wardrobe layers) OR bless emoji for beta | Decision recorded; assets ordered if commissioned |
| [x] | 3 | App icon + splash (àdìrẹ-pattern placeholder is fine) & display name — **current UI is the functional skeleton, not final design**; this + avatar art is where visual identity lands | Passes App Store asset validation — icon.png verified 1024×1024, no alpha channel |
| [x] | 3 | PostHog: session, lesson_start/complete, review_done, streak_day, contract events schema | `session_started`, `lesson_started`/`lesson_completed`, `review_completed`, `streak_extended` (guarded to fire once per day the streak actually increments) all wired. Contract events deliberately **not** added — the Immersion Contract feature doesn't exist until Sprint 5; schema lands with the feature. Dashboard visibility needs a real `EXPO_PUBLIC_POSTHOG_KEY` (🔑 Harry) |
| [~] | 3 | Sentry crash reporting + source maps | SDK wired since Sprint 1–3; `metro.config.js` added this sprint (`getSentryExpoConfig`) so JS source maps actually generate — previously missing entirely. Upload/symbolication is inert until Harry creates a Sentry project and sets `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`/`EXPO_PUBLIC_SENTRY_DSN` as EAS secrets (🔑) |
| [!] | 3 | `eas build` production profile + TestFlight submission pipeline (`eas submit`) | One-command ship — `eas.json` profiles already in place from earlier sprints; blocked on the App Store Connect app record above before it can actually be exercised |
| [~] | 3 | Performance/a11y pass: cold start <2s on device, Dynamic Type doesn't break layouts, VoiceOver labels on exercise controls | Dynamic Type: per-type `maxFontSizeMultiplier` caps added to `ThemedText` (display 1.3×, body 1.6×). VoiceOver labels were already broadly present across screens/exercises from earlier sprints. Cold-start audited — no blocking work found before first paint — but the <2s number and an on-device VoiceOver pass still need Harry on a physical iPhone |

**Blockers for Harry:**
1. Create the App Store Connect app record + TestFlight internal group (needed for the submission pipeline item and the M2 acceptance criteria itself).
2. Record the avatar decision — recommend defaulting to "bless emoji for beta" (explicitly allowed by AVATAR_SPEC.md) so this doesn't slip M2; commission later if you want real art before wider beta.
3. Create a Sentry project; set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `EXPO_PUBLIC_SENTRY_DSN` as EAS secrets. Set a production `EXPO_PUBLIC_POSTHOG_KEY` too, if not already set — otherwise both stay silent no-ops.
4. Run `eas build --profile production` + `eas submit` yourself once the App Store Connect record exists (interactive Apple sign-in, same pattern as the Sprint 2 device build).
5. Verify cold start time and VoiceOver behavior on your physical iPhone.

## 8. Sprint 5 — Immersion Contract I (Aug 3 → Aug 7) · 20 pts

**Goal:** the differentiator exists — commitment mechanics first, UI flip next sprint.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 5 | Contract domain model + setup flow: pick 7/14/30 days, daily minimum XP, optional cowrie wager | Stored locally + synced; one active contract max |
| 3 | Contract home-screen card: day N of M, today's minimum, at-risk state | Updates at midnight; survives restart |
| 3 | Completion / failure flows: payout (cowries + exclusive wardrobe item), wager loss, honest "paused" state | All three reachable and tested via debug menu |
| 3 | Device Immersion Checklist v1: guided Yorùbá keyboard install (Gboard/system), each step pays cowries | Steps persist; deep-links to Settings where possible |
| 3 | Immersion i18n groundwork: extract ALL UI strings to i18next catalog (`en` locale) | Zero hardcoded user-facing strings |
| 3 | Debug/QA menu (dev builds): time travel for streak/contract testing, reset profile | Streak & contract testable without waiting real days |

## 9. Sprint 6 — Immersion Contract II: live in Yorùbá (Aug 10 → Aug 14) · 20 pts

**Goal:** during a contract, the app itself is the immersion artifact.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 5 | Full `yo` UI locale (fully diacritized — engineering translation, flagged for later review) | Every screen renders in Yorùbá at immersion level 2 |
| 5 | Tap-and-hold gloss overlay on any UI string (English tooltip) | Works on all screens; glossed words can be added to SRS deck |
| 3 | Progressive immersion levels 0–3 wired to contract + learner level | Level transitions announced; beginner never starts above 1 |
| 2 | Yorùbá notifications during active contract | Copy from i18n catalog |
| 3 | Yorùbá-only input enforcement in free-text exercises during contract (heuristic: charset + wordlist) | English input bounced with in-Yorùbá nudge + hint button |
| 2 | Contract analytics: start/complete/fail/pause funnels in PostHog | Funnel visible |

## 10. Sprint 7 — Task-based learning (Aug 17 → Aug 21) · 20 pts

**Goal:** the second differentiator — Iṣẹ́ missions and stories.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 5 | Task-mission engine: branching multi-step scenario composed of existing exercise types + choice nodes | Data-driven from content JSON; graded on task completion |
| 5 | Missions ×2: "Ọjà" (haggle at the market), "Ìdílé" (greet the family) | Playable end-to-end; validator covers mission schema |
| 5 | Stories (Ìtàn) v1: graded reader screen, tap-word gloss → SRS, 3 stories at i+1 for Units 1–3 | Unknown-word rate ≤10% by construction |
| 3 | Learn-path integration: missions/stories unlock as special nodes | Distinct visual treatment |
| 2 | XP/cowrie balancing pass across lesson/practice/mission/story | Documented economy table in this file |

## 11. Sprint 8 — Closed beta → **M3** (Aug 24 → Aug 28) · 19 pts

**Goal:** 25–50 real heritage learners using it; we fix what they hit.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 🔑 5 | Recruit 25–50 beta testers: diaspora orgs, Nigerian student associations, Yoruba-learning TikTok/IG creators, family WhatsApp | ≥25 TestFlight installs |
| 🔑 2 | Set up a feedback channel (TestFlight feedback + a WhatsApp/Discord group) | Testers know where to talk |
| 3 | Sign in with Apple (replaces device-id as primary identity; device id becomes fallback) | Progress survives phone migration |
| 3 | In-app feedback affordance ("report a content error" on any exercise → logs vocab/lesson id) | Reports land somewhere queryable |
| 5 | Beta-feedback fix budget (reserved) | Top crashes + top 5 UX complaints addressed |
| 1 | Beta metrics dashboard: D1/D7 retention, contract completion, lesson funnel | Reviewed at Friday ceremony |

## 12. Sprint 9 — Launch hardening (Aug 31 → Sep 4) · 20 pts

**Goal:** everything the App Store and a public user demands.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 🔑 3 | Privacy policy + terms (template + review), support email/page | URLs live (required by App Review) |
| 🔑 3 | App Store listing: screenshots, description, keywords ("learn Yoruba" ASO), category | Listing complete in App Store Connect |
| 5 | Units 5–6 content ("Ìrìnàjò" travel/directions, "Ojoojúmọ́" daily verbs) | Launch promise: 6 units |
| 3 | Second beta build with feedback round 2 fixes | Crash-free rate >99% |
| 3 | Account deletion + data export endpoints (App Review requirement with SiwA) | Delete wipes Learner + logs |
| 3 | Server hardening: rate limiting, request size caps, deviceId abuse guard, DB backup check | Basic abuse doesn't fall over; 🔑 rotate the Prisma key that was shared in plaintext |

## 13. Sprint 10 — Launch → **M4** (Sep 7 → Sep 11) · ~14 pts + buffer

**Goal:** approved and public. Deliberately light — review round-trips eat time.

| Pts | Item | Acceptance criteria |
|---|---|---|
| 🔑 2 | Submit for App Review (expect 1 rejection round; resubmit fast) | Approved |
| 3 | Review-rejection fix budget (reserved) | — |
| 🔑 3 | Launch push: personal network, diaspora communities, r/Yoruba, creator DMs from Sprint 8 | Day-1 installs measured |
| 2 | Post-launch monitoring: Sentry alerts, PostHog launch dashboard, server health | On-call = check twice daily first week |
| 2 | App Store review prompt (after first contract completion or 7-day streak) | Prompts at the emotional high point |
| 2 | Retro + re-plan: Phase 3 sprint plan (leagues, friends, audio program kickoff) | Next plan drafted |

---

## 14. Deferred / Icebox (explicitly out of MVP)

- **Native-speaker content review + audio recording program** — *first item post-launch*; unblocks listening & speaking exercises
- Android + web builds · leagues/leaderboards · friend streaks · premium subscription/monetization · ASR speaking grading · home-screen widget · commissioned avatar art integration (if not done Sprint 4) · FSRS parameter optimization from review logs

## 15. Standing risks

| Risk | Watch for | Mitigation |
|---|---|---|
| Apple Developer enrollment delay | Not approved by Sprint 4 | Enroll Sprint 2 Monday; M2 slips before scope does |
| Solo-founder burnout / sprint overrun | 2 consecutive sprints <70% done | Cut M3 scope (1 mission, stories post-launch), never cut Sprint 1–2 retention items |
| Unreviewed Yorùbá content embarrasses us in beta | Beta testers with native-speaker family flag errors | In-app content-error reporting (Sprint 8) + fix fast; be upfront in beta notes |
| App Review rejection (account deletion, privacy) | — | Requirements built in Sprint 9 before submission |
| Immersion mode churns beginners | Contract failure rate >60% in beta | Progressive levels + easy pause already designed; tune with Sprint 6 analytics |

## 16. Metrics reviewed every Friday

- D1 / D7 retention (PostHog cohorts) — targets: 40% / 20% by M3
- Lesson completion funnel (start → finish) — >85%
- Practice adherence (due cards cleared/day) — >50%
- Contract completion rate (from M3) — >40%
- Crash-free sessions — >99%
