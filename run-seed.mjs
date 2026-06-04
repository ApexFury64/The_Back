import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';

// Load .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("POSTGRES_URL is", process.env.POSTGRES_URL ? "Set" : "Not Set");

execSync('npx ts-node -O "{\\"module\\":\\"commonjs\\"}" prisma/seed.ts', { stdio: 'inherit' });
