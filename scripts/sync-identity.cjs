const fs = require('fs');
const path = require('path');

// Paths
const packageJsonPath = path.join(__dirname, '../package.json');
const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
const sidebarPath = path.join(__dirname, '../src/components/common/SideNavigation.tsx');
const readmePath = path.join(__dirname, '../README.md');

// Load Version
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = pkg.version;
const [major, minor, patch] = version.split('.').map(Number);

// Calculate Android versionCode: (Minor * 100) + Patch
// Example: 1.1.9 -> 109
const versionCode = (minor * 100) + patch;

console.log(`\n\x1b[32m[Martabak Sync]\x1b[0m Synchronizing Version: \x1b[36mv${version}\x1b[0m (Code: ${versionCode})`);

// 1. Sync Android build.gradle
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  content = content.replace(/versionCode \d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  fs.writeFileSync(buildGradlePath, content);
  console.log('\x1b[32m \u2713\x1b[0m Android build.gradle updated.');
}

// 2. Sync SideNavigation.tsx
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf8');
  content = content.replace(/Martabak SetiaRasa &bull; v[\d.]+/, `Martabak SetiaRasa &bull; v${version}`);
  fs.writeFileSync(sidebarPath, content);
  console.log('\x1b[32m \u2713\x1b[0m SideNavigation.tsx updated.');
}

// 3. Sync README.md
if (fs.existsSync(readmePath)) {
  let content = fs.readFileSync(readmePath, 'utf8');
  // Update header and core features version
  content = content.replace(/App \(v[\d.]+\)/, `App (v${version})`);
  content = content.replace(/Core Features \(v[\d.]+\)/, `Core Features (v${version})`);
  fs.writeFileSync(readmePath, content);
  console.log('\x1b[32m \u2713\x1b[0m README.md updated.');
}

console.log('\x1b[32m[Sync Complete] Identity synchronized across all platforms!\x1b[0m\n');
