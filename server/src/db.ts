// Env loading: the platform provides it on Vercel; the local/Docker entry
// point (index.ts) loads dotenv before importing this module.
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({ adapter });
