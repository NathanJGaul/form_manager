import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getGitInfo() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return { commit, commitShort, branch };
  } catch (error) {
    console.warn('Git information not available:', error.message);
    return { commit: 'unknown', commitShort: 'unknown', branch: 'unknown' };
  }
}

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    console.warn('Package version not available:', error.message);
    return '0.0.0';
  }
}

export function getBuildInfo(environment = 'development') {
  const gitInfo = getGitInfo();
  const version = getPackageVersion();
  
  return {
    version,
    commit: gitInfo.commit,
    commitShort: gitInfo.commitShort,
    branch: gitInfo.branch,
    buildTime: new Date().toISOString(),
    environment,
    buildMode: process.env.NODE_ENV || environment
  };
}

// If called directly, output JSON
if (import.meta.url === `file://${process.argv[1]}`) {
  const environment = process.argv[2] || 'development';
  const buildInfo = getBuildInfo(environment);
  console.log(JSON.stringify(buildInfo, null, 2));
}