/**
 * Course content schema. Content lives in `content/course.yo-en.json` and is
 * validated by `scripts/validate-content.mjs`. Yorùbá strings must be fully
 * diacritized (NFC) — learner input is graded leniently, display is not.
 */

export type TonePattern = string; // e.g. "MH" | "LL" — one letter (L/M/H) per syllable

export interface VocabItem {
  id: string;
  yo: string;
  en: string;
  tonePattern?: TonePattern;
  /** Set once native-speaker audio is recorded (Phase 1 content task). */
  audio?: string;
  tags?: string[];
}

export interface SelectTranslationExercise {
  type: 'select_translation';
  /** Direction 'yo->en' is decode practice (brief: translate target → native). */
  direction: 'yo->en' | 'en->yo';
  prompt: string;
  choices: string[];
  answer: string;
  vocabIds: string[];
  /** Shown after answering, e.g. a tone tip for minimal pairs. */
  note?: string;
}

export interface WordBankExercise {
  type: 'word_bank';
  direction: 'yo->en' | 'en->yo';
  prompt: string;
  tokens: string[];
  answer: string[];
  vocabIds: string[];
  note?: string;
}

export interface MatchPairsExercise {
  type: 'match_pairs';
  pairs: { yo: string; en: string }[];
  vocabIds: string[];
}

export type Exercise =
  | SelectTranslationExercise
  | WordBankExercise
  | MatchPairsExercise;

export interface Lesson {
  id: string;
  titleYo: string;
  titleEn: string;
  xp: number;
  exercises: Exercise[];
  /** Vocab introduced here; seeds the learner's SRS deck on completion. */
  vocabIds: string[];
}

export interface Unit {
  id: string;
  titleYo: string;
  titleEn: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  version: number;
  sourceLang: 'en';
  targetLang: 'yo';
  vocab: VocabItem[];
  units: Unit[];
}
