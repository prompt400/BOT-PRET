#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: npm run db:migrate:create <migration-name>');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
const fileName = `${timestamp}_${migrationName}.sql`;
const migrationsDir = join(__dirname, '..', 'migrations');

// Create migrations directory if it doesn't exist
mkdirSync(migrationsDir, { recursive: true });

const template = `-- Migration: ${migrationName}
-- Created at: ${new Date().toISOString()}

-- UP
BEGIN;

-- Add your migration SQL here

COMMIT;

-- DOWN
BEGIN;

-- Add your rollback SQL here

COMMIT;
`;

const filePath = join(migrationsDir, fileName);
writeFileSync(filePath, template);

console.log(`✅ Created migration: ${fileName}`);
