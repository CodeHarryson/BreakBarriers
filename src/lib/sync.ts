/**
 * Best-effort push sync to the BreakBarriers API (server/). The device is the
 * source of truth; sync failures are silent and retried on the next trigger.
 * Set EXPO_PUBLIC_API_URL (see .env.example) — sync is a no-op without it.
 */
import { useEffect } from 'react';

import { getDeviceId } from '@/lib/device-id';
import { useProfile, type RemoteProfile } from '@/state/profile';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEBOUNCE_MS = 4000;
const FETCH_TIMEOUT_MS = 5000;

/**
 * Look up a previous profile for this device (restore-on-reinstall).
 * Returns null when sync is off, offline, or nothing meaningful is stored.
 */
export async function fetchRemoteProfile(): Promise<RemoteProfile | null> {
  if (!API_URL) return null;
  try {
    const deviceId = await getDeviceId();
    const res = await fetch(`${API_URL}/learners/${deviceId}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const remote = (await res.json()) as RemoteProfile;
    return remote.xp > 0 ? remote : null;
  } catch {
    return null; // offline / server down — onboarding proceeds fresh
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

export async function pushProfile(): Promise<void> {
  if (!API_URL || inFlight) return;
  inFlight = true;
  try {
    const deviceId = await getDeviceId();
    const s = useProfile.getState();
    await fetch(`${API_URL}/learners/${deviceId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        xp: s.xp,
        cowries: s.cowries,
        currentStreak: s.streak.current,
        longestStreak: s.streak.longest,
        streakFreezes: s.streak.freezes,
        lastActiveDate: s.streak.lastActiveDate,
        avatar: s.avatar,
        ownedItems: s.ownedItems,
        completedLessons: s.completedLessons,
        srsDeck: s.srsDeck,
        reviewLogs: s.reviewLog.slice(-500),
      }),
    });
  } catch {
    // Offline or server down — the next state change tries again.
  } finally {
    inFlight = false;
  }
}

function schedulePush() {
  if (!API_URL) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void pushProfile();
  }, DEBOUNCE_MS);
}

/** Mount once (root layout): debounced push on every profile change. */
export function useProfileSync(): void {
  useEffect(() => {
    void pushProfile();
    const unsubscribe = useProfile.subscribe(schedulePush);
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
}
