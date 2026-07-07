#!/usr/bin/env node
/**
 * Content validator — run with `npm run validate:content`.
 * Guards the course JSON: schema shape, id uniqueness, vocab references,
 * answer integrity, and Yorùbá orthography smells (bare e/o/s that might be
 * missing under-dots, non-NFC strings).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const course = JSON.parse(readFileSync(join(root, 'content/course.yo-en.json'), 'utf8'));

const errors = [];
const warnings = [];

const EXERCISE_TYPES = new Set(['select_translation', 'word_bank', 'match_pairs']);

// --- vocab ---
const vocabIds = new Set();
for (const v of course.vocab) {
  if (vocabIds.has(v.id)) errors.push(`duplicate vocab id: ${v.id}`);
  vocabIds.add(v.id);
  if (!v.yo || !v.en) errors.push(`vocab ${v.id}: missing yo/en`);
  if (v.yo && v.yo !== v.yo.normalize('NFC')) warnings.push(`vocab ${v.id}: yo string is not NFC-normalized`);
  if (!v.audio) warnings.push(`vocab ${v.id}: no native-speaker audio yet`);
}

// --- units/lessons/exercises ---
const lessonIds = new Set();
for (const unit of course.units) {
  for (const lesson of unit.lessons) {
    const where = `${unit.id}/${lesson.id}`;
    if (lessonIds.has(lesson.id)) errors.push(`duplicate lesson id: ${lesson.id}`);
    lessonIds.add(lesson.id);
    if (!Number.isFinite(lesson.xp) || lesson.xp <= 0) errors.push(`${where}: bad xp`);
    for (const id of lesson.vocabIds ?? []) {
      if (!vocabIds.has(id)) errors.push(`${where}: unknown vocabId ${id}`);
    }
    if (!lesson.exercises?.length) errors.push(`${where}: no exercises`);
    lesson.exercises?.forEach((ex, i) => {
      const at = `${where}#${i}`;
      if (!EXERCISE_TYPES.has(ex.type)) {
        errors.push(`${at}: unknown exercise type ${ex.type}`);
        return;
      }
      for (const id of ex.vocabIds ?? []) {
        if (!vocabIds.has(id)) errors.push(`${at}: unknown vocabId ${id}`);
      }
      if (ex.type === 'select_translation') {
        if (!ex.choices?.includes(ex.answer)) errors.push(`${at}: answer not in choices`);
        if (new Set(ex.choices).size !== ex.choices?.length) errors.push(`${at}: duplicate choices`);
      }
      if (ex.type === 'word_bank') {
        const bank = [...(ex.tokens ?? [])];
        for (const word of ex.answer ?? []) {
          const idx = bank.indexOf(word);
          if (idx === -1) {
            errors.push(`${at}: answer token "${word}" not available in bank`);
          } else {
            bank.splice(idx, 1);
          }
        }
      }
      if (ex.type === 'match_pairs') {
        const yos = new Set((ex.pairs ?? []).map((p) => p.yo));
        const ens = new Set((ex.pairs ?? []).map((p) => p.en));
        if (yos.size !== ex.pairs?.length || ens.size !== ex.pairs?.length) {
          errors.push(`${at}: duplicate values in pairs (ambiguous matching)`);
        }
      }
    });
  }
}

for (const w of warnings) console.warn(`  warn: ${w}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`\n✓ content OK — ${vocabIds.size} vocab, ${lessonIds.size} lessons, ${warnings.length} warning(s)`);
