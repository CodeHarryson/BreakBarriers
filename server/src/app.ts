/**
 * BreakBarriers sync API (MVP).
 *
 * The app is offline-first; the device is the source of truth. Sync is a
 * last-write-wins snapshot push plus an append-only review-log stream (the
 * raw material for FSRS optimization later). Identity is an anonymous
 * device id until Sign in with Apple lands.
 *
 * Exported as a plain Hono app so it can run under the local Node server
 * (src/index.ts, Docker/Fly) or as a Vercel function (/api at repo root).
 */
import { Hono } from 'hono';

import { prisma } from './db.js';

export const app = new Hono();

app.get('/health', (c) => c.json({ ok: true }));

interface SyncBody {
  xp?: number;
  cowries?: number;
  currentStreak?: number;
  longestStreak?: number;
  streakFreezes?: number;
  lastActiveDate?: string | null;
  avatar?: unknown;
  ownedItems?: unknown;
  completedLessons?: unknown;
  srsDeck?: unknown;
  reviewLogs?: { vocabId: string; rating: number; reviewedAt: string }[];
}

const DEVICE_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

app.put('/learners/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId');
  if (!DEVICE_ID_RE.test(deviceId)) return c.json({ error: 'bad deviceId' }, 400);

  let body: SyncBody;
  try {
    body = await c.req.json<SyncBody>();
  } catch {
    return c.json({ error: 'invalid JSON' }, 400);
  }

  const snapshot = {
    xp: body.xp ?? 0,
    cowries: body.cowries ?? 0,
    currentStreak: body.currentStreak ?? 0,
    longestStreak: body.longestStreak ?? 0,
    streakFreezes: body.streakFreezes ?? 0,
    lastActiveDate: body.lastActiveDate ?? null,
    avatar: (body.avatar ?? undefined) as object | undefined,
    ownedItems: (body.ownedItems ?? undefined) as object | undefined,
    completedLessons: (body.completedLessons ?? undefined) as object | undefined,
    srsDeck: (body.srsDeck ?? undefined) as object | undefined,
  };

  const learner = await prisma.learner.upsert({
    where: { deviceId },
    create: { deviceId, ...snapshot },
    update: snapshot,
  });

  const logs = (body.reviewLogs ?? []).slice(-500); // cap one push
  if (logs.length > 0) {
    await prisma.reviewLog.createMany({
      data: logs.map((l) => ({
        learnerId: learner.id,
        vocabId: l.vocabId,
        rating: l.rating,
        reviewedAt: new Date(l.reviewedAt),
      })),
      skipDuplicates: true,
    });
  }

  return c.json({ ok: true, learnerId: learner.id, syncedLogs: logs.length });
});

/** Restore endpoint — used on fresh installs to recover progress. */
app.get('/learners/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId');
  if (!DEVICE_ID_RE.test(deviceId)) return c.json({ error: 'bad deviceId' }, 400);
  const learner = await prisma.learner.findUnique({ where: { deviceId } });
  if (!learner) return c.json({ error: 'not found' }, 404);
  return c.json(learner);
});
