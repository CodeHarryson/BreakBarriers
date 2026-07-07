/**
 * Vercel serverless entry — mounts the sync API under /api.
 * Local/Docker deployments use server/src/index.ts instead.
 */
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import { app } from '../server/src/app.js';

const vercelApp = new Hono().basePath('/api').route('/', app);

export default handle(vercelApp);
