/**
 * Vercel serverless entry — all /api/* requests are rewritten here
 * (see vercel.json); Hono handles the routing internally.
 * Local/Docker deployments use server/src/index.ts instead.
 */
import { listener } from '../server/src/vercel.js';

export default listener;
