import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env');
  const envConfig = fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim().replace(/^["'](.*)["']$/, '$1');
      }
      return acc;
    }, {} as Record<string, string>);

  for (const key in envConfig) {
    process.env[key] = process.env[key] || envConfig[key];
  }
}

// Create a single instance of Prisma Client to be used throughout the app
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
