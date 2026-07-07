import type { Course, Lesson, Unit, VocabItem } from '@/types/content';

import courseJson from '../../content/course.yo-en.json';

export const course = courseJson as unknown as Course;

const vocabById = new Map<string, VocabItem>(course.vocab.map((v) => [v.id, v]));

const lessonById = new Map<string, { lesson: Lesson; unit: Unit }>();
const lessonOrder: string[] = [];
for (const unit of course.units) {
  for (const lesson of unit.lessons) {
    lessonById.set(lesson.id, { lesson, unit });
    lessonOrder.push(lesson.id);
  }
}

export function getVocab(id: string): VocabItem | undefined {
  return vocabById.get(id);
}

export function getLesson(id: string): { lesson: Lesson; unit: Unit } | undefined {
  return lessonById.get(id);
}

/** Lessons unlock strictly in course order. */
export function isLessonUnlocked(id: string, completed: Record<string, true>): boolean {
  const index = lessonOrder.indexOf(id);
  if (index <= 0) return index === 0;
  return completed[lessonOrder[index - 1]] === true;
}
