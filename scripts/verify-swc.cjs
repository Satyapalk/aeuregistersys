const { existsSync } = require('fs');
const path = require('path');

const pkg = require(path.join(__dirname, '..', 'node_modules', '@next', 'swc-win32-x64-msvc', 'package.json'));

console.log(`platform=${process.platform} arch=${process.arch}`);
console.log(`next=${require(path.join(__dirname, '..', 'node_modules', 'next', 'package.json')).version}`);
console.log(`@next/swc-win32-x64-msvc version=${pkg.version}`);

const binary = path.join(
  __dirname,
  '..',
  'node_modules',
  '@next',
  'swc-win32-x64-msvc',
  `next-swc.${process.platform}-${process.arch}-msvc.node`
);

console.log(`binary=${binary}`);
if (!existsSync(binary)) {
  console.error('ERROR: SWC native binary not found. Run `npm install` on Windows x64.');
  process.exit(1);
}

async function main() {
  const { loadBindings } = require('next/dist/build/swc');
  let bindings;
  try {
    bindings = await loadBindings();
  } catch (err) {
    console.error('ERROR: Next.js could not load SWC bindings:', err.message || err);
    process.exit(1);
  }

  if (bindings.isWasm !== false) {
    console.error('ERROR: WASM bindings were loaded instead of the native Windows binary.');
    process.exit(1);
  }

  const out = await bindings.transform('const answer: number = 42;', {
    jsc: { parser: { syntax: 'typescript' } },
  });

  if (typeof out.code !== 'string' || !out.code.includes('answer = 42')) {
    console.error('ERROR: SWC transform produced unexpected output.');
    process.exit(1);
  }

  console.log('OK: Native SWC binary (win32-x64-msvc) loads and transforms TypeScript successfully.');
  console.log(`    transform output: ${out.code.trim()}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});