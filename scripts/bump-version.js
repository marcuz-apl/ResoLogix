const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let currentVersion = packageJson.version;

// Parse version: m.n.p
const parts = currentVersion.split('.');
if (parts.length !== 3) {
  // If no valid format is found, fallback to 0.0.1
  currentVersion = '0.0.0';
  parts[0] = '0';
  parts[1] = '0';
  parts[2] = '0';
}

let m = parseInt(parts[0], 10);
let n = parseInt(parts[1], 10);
let p = parseInt(parts[2], 10);

if (isNaN(m)) m = 0;
if (isNaN(n)) n = 0;
if (isNaN(p)) p = 0;

// Increment logic
p += 1;

if (p > 9) {
  p = 0;
  n += 1;
}

if (n > 9) {
  n = 0;
  m += 1;
}

const newVersion = `${m}.${n}.${p}`;
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

console.log(`Bumped version from ${currentVersion} to ${newVersion}`);
