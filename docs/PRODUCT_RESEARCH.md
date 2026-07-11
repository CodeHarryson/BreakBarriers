# Asa mi — Product Research

*Yoruba immersion language-learning app · Research compiled July 2026*

---

## 1. The Opportunity

### The market gap is real and unusually clean

- **Duolingo does not offer Yoruba.** Its only African language is Swahili, despite Yoruba having roughly **45–50 million native speakers** plus millions of L2 speakers. There is documented, unmet demand (public petitions asking Duolingo to add Nigerian languages, active Reddit/forum threads, "Duolingo alternatives for Yoruba" being a whole SEO category).
- Yoruba is **one of the most widely learned African languages as a second language**, especially in Europe and the Americas.
- The biggest learner populations outside Nigeria: **US, UK, Canada, Germany** (Preply tutor-demand data).

### Who the learners are

| Segment | Motivation | Notes |
|---|---|---|
| **Diaspora heritage learners** (primary) | Reconnect with family, culture, identity | 2nd/3rd-generation Nigerians who understand fragments but can't speak. High emotional motivation → high willingness to pay and high tolerance for a demanding "immersion" format. |
| Partners/spouses of Yoruba speakers | Family integration, weddings, in-laws | Need practical conversational tasks (greetings, respect registers, family events). |
| Culture-curious learners | Music (Afrobeats), Ifá/Orisha spiritual traditions, Nollywood | Growing globally; lighter commitment. |
| Academics/professionals | Study, NGO work, business in Nigeria | Smaller but steady. |

The heritage segment is the beachhead: they already *hear* Yoruba around them (built-in comprehensible input reinforcement), they have family "accountability partners," and the immersion-commitment framing ("do this for 30 days for your grandmother") is a powerful marketing hook.

---

## 2. Competitive Landscape

| App | Approach | Weaknesses we exploit |
|---|---|---|
| **Ling** | Templated multi-language lessons + chatbot | Same course shell for 60+ languages; shallow Yoruba-specific content; weak tone instruction |
| **Drops** | Visual vocab, 5-min sessions | Vocabulary only — no grammar, no conversation, no tasks |
| **Memrise** | Community decks, native-speaker videos | No structured path for Yoruba; quality varies wildly |
| **Bluebird** | Massive audio phrase library | Passive listen-and-repeat; no gamification, no adaptivity |
| **iSabi Yoruba+** | Pronunciation drills with native audio | Narrow scope; dated UX |
| **Dialogue Africa** | African-language courses incl. Yoruba | Closest cultural competitor; limited gamification depth and no immersion mechanic |
| **SpeakYoruba / LearnYoruba.org** | Kids-focused / nonprofit classes | Not a self-serve adult app experience |

**Nobody in this space combines:** (1) a Duolingo-grade gamified core loop, (2) a genuine immersion commitment mechanic, (3) modern SRS scheduling, and (4) Yoruba-first content (tones, diacritics, culture) rather than a translated template. That combination is the product.

---

## 3. Learning-Science Validation of the Chosen Methods

The four methods in the product brief are well supported — and they compose into one coherent loop:

1. **Total immersion** — Maximizing target-language exposure and forcing production ("output pressure") accelerates automaticity. The *user-defined time commitment* also functions as a psychological commitment device (same family as Duolingo's streak wager, which lifts day-14 retention by ~14%).
2. **Task-based learning (TBLT)** — Learning by *doing something* with the language (haggle at the market, give directions, plan a naming ceremony) produces better transfer than drill-only formats. Translating Yoruba → English (the brief's "actively translating target language into their natural language") is *decoding practice* — exactly the right direction for building comprehension early.
3. **Comprehensible Input (Krashen's i+1)** — Learners acquire language from input slightly above their level. Implemented as graded stories, dialogues, and audio where ~90–95% of content is already known.
4. **Spaced Repetition (SRS)** — The best-evidenced technique in the list. **FSRS** (the modern open-source scheduler, now Anki's default) needs **20–30% fewer reviews than the classic SM-2 algorithm** for the same retention, and has maintained implementations in TypeScript, Python, Rust, etc. We should use FSRS, not roll our own.

**How they compose:** Comprehensible input feeds new vocabulary → SRS retains it → tasks force production → immersion mode raises the ambient exposure and the stakes.

---

## 4. Gamification Research (Duolingo model)

Numbers from published analyses of Duolingo's mechanics:

- **Streaks** are the single most effective mechanic (loss aversion). Streaks increase commitment ~60%; streak-repair items (freezes, weekend amulets) are essential to prevent rage-quit after a broken streak.
- **XP leaderboards/leagues** drive ~40% more engagement — but ship *after* the core loop is solid (leagues need a user base to matter).
- **Soft currency + customization** (gems → cosmetics) closes the reward loop.

**Asa mi adaptations (culturally native, not skinned):**
- **Currency: cowries (owó ẹyọ)** — the historical Yoruba currency. Perfect thematic fit for "earn and spend."
- **Avatar wardrobe as level rewards:** aṣọ òkè fabrics, gèlè (headwrap), agbádá, fìlà, coral beads, talking-drum accessories — unlocked by level, purchasable with cowries. This is a genuine differentiator: cultural pride *is* the collectible.
- **Streak = "Iná" (fire)** with freezes purchasable in cowries.
- **Immersion Contract** as the flagship mechanic (see §5): a chosen commitment period with escalating rewards for completing it intact.

---

## 5. Feasibility Findings (these shape the plan)

### 5.1 "Turn the phone's language to Yoruba" — cannot be done programmatically
Mobile OS sandboxing means **no app can change the system language on iOS or Android**. Additionally, **iOS does not offer Yoruba as a system language at all**; Android supports Yoruba as a locale on many devices, and Gboard/SwiftKey support Yoruba keyboards. So the feature must be reframed:

- **In-app total immersion (core):** during an active Immersion Contract, the app's entire UI renders in Yoruba (with tap-and-hold gloss for any UI string — that keeps it comprehensible input rather than frustration).
- **Notifications in Yoruba** during immersion.
- **Guided device setup (companion):** a checklist that walks Android users through switching their system language to Yorùbá and installing the Gboard Yoruba keyboard; iOS users get keyboard + widget guidance. Completing the checklist earns cowries.
- **Home-screen widget** showing the streak and a "phrase of the day" in Yoruba — ambient immersion on both platforms.

### 5.2 Yoruba text: tones and diacritics are the make-or-break quality bar
Yoruba is a **three-tone language** (low `è`, mid `e`, high `é`) with under-dot letters (ẹ, ọ, ṣ). Most digital Yoruba text is written *without* diacritics, and tone changes meaning (`ọkọ` husband / `ọkọ̀` vehicle / `ọ̀kọ̀` spear). Implications:

- All course content must be **fully diacritized** and reviewed by native speakers — this is the content moat competitors skip.
- Answer checking must **accept undiacritized input** (learners' keyboards often can't produce marks) while *teaching* the marks — grade leniently, display correctly, and offer an in-app tone-mark input row.
- Tone must be taught **explicitly and early** with audio + visual pitch contours; this is where every competitor is weak.

### 5.3 Speech technology for Yoruba is immature — don't bet the MVP on it
- Whisper transcribes Yoruba poorly and **drops diacritics**; ASR for Yoruba is an active research area (YorùLect corpus, Meta MMS) but not product-grade.
- TTS exists (Lingvanex, research systems) but quality is inconsistent for a tonal language.

**Decision:** MVP uses **recorded native-speaker audio** (higher quality, culturally authentic, and a marketing asset). Speaking exercises start as *record → compare waveform/pitch to native audio → self-assess*, with real ASR grading deferred to a later phase (fine-tuned MMS/Whisper when feasible).

### 5.4 "Force the user to only speak the target language in the app"
Feasible and cheap for **text**: during immersion sessions, free-text inputs (chat exercises, community posts) run a language check — English gets bounced with a gentle in-Yoruba prompt and a hint button. For **voice**, enforcement waits for the ASR phase; until then, speaking tasks are structured (read-aloud, fill-in) rather than free-form.

---

## 6. Positioning

> **Asa mi: the first serious Yoruba app.** Commit to an immersion period, live in Yorùbá, and earn your heritage back — one streak at a time.

- **vs. Duolingo:** they don't have Yoruba. Full stop. We borrow their loop and beat them on depth.
- **vs. Ling/Drops/Bluebird:** they translated a template into Yoruba. We built Yoruba-first: real tones, real diacritics, real culture, real commitment.
- **Monetization (later phases):** freemium — free core path with hearts/energy; **Premium** unlocks unlimited practice, offline packs, streak insurance, and exclusive avatar wardrobe; one-time "Immersion Intensive" packs (7/14/30-day guided programs) fit the commitment mechanic naturally.

## 7. Key Risks

| Risk | Mitigation |
|---|---|
| Content production (diacritized text + native audio) is the true cost center | Start with a tight 3-unit MVP scope; hire 1–2 native-speaker linguists early; build content tooling (see plan) before building more app features |
| Immersion mode frustrates beginners → churn | Progressive immersion (UI flips in stages as level rises), always-available tap-to-gloss, easy pause with honest "contract paused" framing |
| Yoruba ASR/TTS not ready | Recorded audio MVP; revisit ASR in Phase 4 |
| Duolingo eventually adds Yoruba | Speed + cultural depth + community; a template course can't match heritage-learner positioning |
| Dialect variation (Standard vs. regional Yorùbá) | Teach Standard Yorùbá; flag common dialect variants in notes |

---

## Sources

- [Ling: 6 Best Language Apps To Learn Yoruba In 2026](https://ling-app.com/blog/apps-to-learn-yoruba/) · [No Yoruba On Duolingo?](https://ling-app.com/blog/no-yoruba-on-duolingo/)
- [Lingalot: Does Duolingo Have Yoruba?](https://www.lingalot.com/does-duolingo-have-yoruba/) · [Change.org petition to add Nigerian languages to Duolingo](https://www.change.org/p/add-nigeria-languages-hausa-ibibio-igbo-yoruba-to-duolingo)
- [Dialogue Africa — Learn Yoruba](https://www.dialogue-africa.com/course/Learn-Yoruba) · [Memrise Yoruba](https://www.memrise.com/en-us/learn-yoruba) · [Drops Yoruba](https://languagedrops.com/language/learn-yoruba) · [Bluebird: Learn Yoruba](https://apps.apple.com/us/app/bluebird-learn-yoruba/id1582139372) · [iSabi Yoruba+](https://apps.apple.com/us/app/isabi-yoruba/id1323909221) · [SpeakYoruba](http://www.speakyorubaapp.com/)
- [Voices Unheard: NLP Resources and Models for Yorùbá Regional Dialects (YorùLect)](https://arxiv.org/html/2406.19564v1) · [Improving Yorùbá Diacritic Restoration](https://arxiv.org/pdf/2003.10564) · [YAD: T5 for Yorùbá Diacritization](https://arxiv.org/pdf/2412.20218)
- [awesome-fsrs (Open Spaced Repetition)](https://open-spaced-repetition.github.io/awesome-fsrs/) · [FSRS vs SM-2 explained](https://studyglen.com/guides/best-spaced-repetition-apps) · [Domenic Denicola on FSRS](https://domenic.me/fsrs/)
- [Trophy: Duolingo Gamification Case Study (2026)](https://trophy.so/blog/duolingo-gamification-case-study) · [StriveCloud: Duolingo gamification](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo) · [Duolingo streak system breakdown](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [Android per-app language preferences](https://developer.android.com/guide/topics/resources/app-languages) · [Typing Yoruba on mobile keyboards](https://mobility.com.ng/type-yoruba-igbo-languages-on-phone-keyboard/)
- [Lacuna: British Nigerians taking Yoruba lessons](https://lacuna.org.uk/migration/meet-the-young-british-nigerians-who-are-taking-yoruba-language-lessons/) · [Preply: Why learn Yoruba](https://preply.com/en/blog/why-learn-yoruba/) · [Yoruba language — Wikipedia](https://en.wikipedia.org/wiki/Yoruba_language)
