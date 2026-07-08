/**
 * Lenient answer grading for free-text Yorùbá.
 *
 * Learners often can't type tone marks or under-dots, and most digital Yorùbá
 * is written in bare ASCII. So we accept undiacritized input as correct — but
 * detect when marks were dropped so the UI can teach the correct form (a "tone
 * tip") rather than silently accept it. Display always uses full diacritics;
 * only *grading* is lenient.
 */

/** NFD strips combining tone accents; then fold under-dot letters to ASCII. */
function stripDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining tone accents (grave/acute/macron/dot-below)
    .replace(/ṣ/g, 's') // ṣ (if it survived NFD as a precomposed form)
    .replace(/Ṣ/g, 'S')
    .toLowerCase();
}

/** Normalize for comparison: strip marks, collapse whitespace, drop terminal punctuation. */
function normalize(s: string): string {
  return stripDiacritics(s)
    .replace(/[.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type GradeResult =
  | { correct: false }
  | { correct: true; exact: boolean; toneTip: boolean };

/**
 * Grade `input` against one or more accepted answers.
 * - `exact`: matched an answer including all diacritics.
 * - `toneTip`: matched only after stripping marks (learner dropped tones/dots).
 */
export function gradeFreeText(input: string, accepted: string[]): GradeResult {
  const rawInput = input.normalize('NFC').trim();
  for (const answer of accepted) {
    if (rawInput.normalize('NFC') === answer.normalize('NFC')) {
      return { correct: true, exact: true, toneTip: false };
    }
  }
  const normInput = normalize(input);
  for (const answer of accepted) {
    if (normInput === normalize(answer)) {
      return { correct: true, exact: false, toneTip: true };
    }
  }
  return { correct: false };
}
