#!/usr/bin/env node
/**
 * setup-env.js
 * Run automatically via `npm install` (postinstall).
 * Copies .env.local.example → .env.local when .env.local doesn't exist yet.
 * This ensures local development works out of the box after a fresh clone.
 */

const { existsSync, copyFileSync } = require('fs');
const { join } = require('path');

const root = process.cwd();
const example = join(root, '.env.local.example');
const target = join(root, '.env.local');

if (existsSync(example) && !existsSync(target)) {
  copyFileSync(example, target);
  console.log('\n✅  Created .env.local from .env.local.example');
  console.log('   Firebase credentials are already filled in — run `npm run dev` to start.\n');
}
