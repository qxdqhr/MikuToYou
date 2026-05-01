#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getReleaseTag() {
  const fromEnv = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim();
  }
  try {
    return execSync('git describe --tags --abbrev=0', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'dev';
  }
}

const releaseTag = getReleaseTag();
const target = path.resolve(__dirname, '../src/constants/releaseTag.ts');
const content = `export const RELEASE_TAG = '${releaseTag}';\n`;

fs.writeFileSync(target, content, 'utf8');
console.log(`Synced RELEASE_TAG=${releaseTag}`);
