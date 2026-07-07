/**
 * Iná (fire) streak engine. Pure functions over local calendar dates so the
 * logic is unit-testable and timezone bugs stay in one place.
 */

export interface StreakState {
  current: number;
  longest: number;
  /** Local date key (YYYY-MM-DD) of the last day with activity. */
  lastActiveDate: string | null;
  freezes: number;
}

export const initialStreak: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  freezes: 1,
};

/** Local (device-timezone) calendar date key. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const utcA = Date.UTC(ay, am - 1, ad);
  const utcB = Date.UTC(by, bm - 1, bd);
  return Math.round((utcB - utcA) / 86_400_000);
}

/**
 * Apply a day's first completed activity to the streak.
 * Missed days are covered by freezes (one per missed day); otherwise the
 * streak restarts at 1.
 */
export function applyActivity(state: StreakState, today: string = dateKey()): StreakState {
  if (state.lastActiveDate === null) {
    return { ...state, current: 1, longest: Math.max(1, state.longest), lastActiveDate: today };
  }
  const gap = daysBetween(state.lastActiveDate, today);
  if (gap <= 0) return state; // already counted today (or clock moved back)
  let current: number;
  let freezes = state.freezes;
  const missed = gap - 1;
  if (missed === 0) {
    current = state.current + 1;
  } else if (missed <= freezes) {
    freezes -= missed;
    current = state.current + 1;
  } else {
    current = 1;
  }
  return {
    current,
    longest: Math.max(state.longest, current),
    lastActiveDate: today,
    freezes,
  };
}

/** Streak shown in the UI: 0 if the streak has already lapsed beyond saves. */
export function effectiveStreak(state: StreakState, today: string = dateKey()): number {
  if (state.lastActiveDate === null) return 0;
  const missed = daysBetween(state.lastActiveDate, today) - 1;
  if (missed > state.freezes) return 0;
  return state.current;
}
