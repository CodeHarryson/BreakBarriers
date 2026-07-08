/**
 * Vercel Node-runtime handler. A vercel.json rewrite sends every /api/* path
 * to the single function, which sees the original URL; Hono routes it.
 */
import { getRequestListener } from '@hono/node-server';
import { Hono } from 'hono';

import { app } from './app.js';

const root = new Hono().basePath('/api').route('/', app);

export const listener = getRequestListener(root.fetch);
