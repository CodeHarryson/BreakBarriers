/**
 * Local / Docker / Fly entry point. Vercel deployments use /api at the repo
 * root instead. The API itself lives in src/app.ts.
 */
import 'dotenv/config';

import { serve } from '@hono/node-server';

import { app } from './app.js';

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, () => {
  console.log(`BreakBarriers sync API listening on :${port}`);
});
