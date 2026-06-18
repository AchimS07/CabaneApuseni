#!/usr/bin/env node
/**
 * server.js
 * Entry point for cPanel / CloudLinux Node.js selector hosting.
 *
 * Set this file as the "Application startup file" in cPanel's Node.js app settings.
 * It starts the Next.js production server after `npm run build` has been run.
 *
 * Prerequisites:
 *   1. Run `npm install` (or `npm ci`) in the application root.
 *   2. Run `npm run build` to generate the `.next` directory.
 *   3. Set `server.js` as the startup file in cPanel Node.js selector.
 *   4. Set the application port via the PORT environment variable (cPanel does this automatically).
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const appDir = __dirname;
const nextBin = path.join(appDir, 'node_modules', '.bin', 'next');
const dotNextDir = path.join(appDir, '.next');

// Ensure .next build output exists; if not, run the build first
if (!fs.existsSync(dotNextDir)) {
  console.log('⚙️  .next directory not found — running "npm run build"...');
  execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
}

// Start the Next.js production server
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting Next.js on ${host}:${port}`);

const server = spawn(nextBin, ['start', '-p', String(port), '-H', host], {
  cwd: appDir,
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

server.on('close', (code) => {
  process.exit(code ?? 1);
});
