const { cpSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const publicDir = path.join(root, 'public');
const staticDir = path.join(root, '.next', 'static');

if (!existsSync(standaloneDir)) {
  console.error('[prepare-standalone] Missing .next/standalone. Run `npm run build` first.');
  process.exit(1);
}

mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, path.join(standaloneDir, 'public'), { recursive: true });
  console.log('[prepare-standalone] Copied public/ -> .next/standalone/public/');
}

if (existsSync(staticDir)) {
  mkdirSync(path.join(standaloneDir, '.next', 'static'), { recursive: true });
  cpSync(staticDir, path.join(standaloneDir, '.next', 'static'), { recursive: true });
  console.log('[prepare-standalone] Copied .next/static/ -> .next/standalone/.next/static/');
}

console.log('[prepare-standalone] Standalone bundle ready at .next/standalone');