const { existsSync } = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function libcLabel() {
  try {
    const report = process.report.getReport();
    const glibc = report && report.header && report.header.glibcVersionRuntime;
    return glibc ? 'gnu' : 'musl';
  } catch {
    return 'gnu';
  }
}

function swcPackageName(platform, arch) {
  switch (platform) {
    case 'win32':
      return `@next/swc-win32-${arch}-msvc`;
    case 'darwin':
      return `@next/swc-darwin-${arch}`;
    case 'linux':
      return `@next/swc-linux-${arch}-${libcLabel()}`;
    default:
      throw new Error(`Unsupported platform for Next.js SWC: ${platform}/${arch}`);
  }
}

function swcBinaryName(platform, arch) {
  switch (platform) {
    case 'win32':
      return `next-swc.win32-${arch}-msvc.node`;
    case 'darwin':
      return `next-swc.darwin-${arch}.node`;
    case 'linux':
      return `next-swc.linux-${arch}-${libcLabel()}.node`;
    default:
      throw new Error(`Unsupported platform for Next.js SWC: ${platform}/${arch}`);
  }
}

const platform = process.platform;
const arch = process.arch;

console.log(`platform=${platform} arch=${arch}`);

const nextPkgPath = path.join(root, 'node_modules', 'next', 'package.json');
if (!existsSync(nextPkgPath)) {
  console.error('ERROR: next is not installed. Run `npm install` first.');
  process.exit(1);
}
const nextVersion = require(nextPkgPath).version;
console.log(`next=${nextVersion}`);
if (nextVersion !== '16.3.4') {
  console.error(`WARNING: expected next 16.3.4, found ${nextVersion}.`);
}

const swcPkg = swcPackageName(platform, arch);
const swcDir = path.join(root, 'node_modules', '@next', swcPkg.replace('@next/', ''));
const installed = existsSync(path.join(swcDir, 'package.json'))
  ? require(path.join(swcDir, 'package.json')).version
  : null;

console.log(`@next/swc package for ${platform}/${arch}: ${swcPkg}${installed ? ` (version ${installed})` : ' (NOT INSTALLED)'}`);

if (nextVersion && installed && installed !== nextVersion) {
  console.error(`ERROR: @next/swc version (${installed}) does not match next version (${nextVersion}). Re-run \`npm install\`.`);
  process.exit(1);
}

const binary = path.join(swcDir, swcBinaryName(platform, arch));
console.log(`binary=${binary}`);
if (!existsSync(binary)) {
  console.error(
    'ERROR: SWC native binary not found. Install dependencies on Windows x64 with "npm install" ' +
      'so npm installs ' + swcPkg + " automatically from next's optionalDependencies. " +
      'Do NOT copy node_modules from Linux or force a platform SWC package.'
  );
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

  console.log(`OK: Native SWC binary (${swcPkg}) loads and transforms TypeScript successfully.`);
  console.log(`    transform output: ${out.code.trim()}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});