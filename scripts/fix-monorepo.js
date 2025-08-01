#!/usr/bin/env node

/**
 * Monorepo Fix Script
 * 
 * This script automatically fixes monorepo architecture violations
 * by removing node_modules and lock files from individual packages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`✅ Removed: ${path.relative(process.cwd(), dirPath)}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to remove ${dirPath}: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`✅ Removed: ${path.relative(process.cwd(), filePath)}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to remove ${filePath}: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
}

function fixMonorepoViolations() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = ['client', 'server', 'shared'];
  let fixedCount = 0;

  log('🔧 Fixing monorepo violations...', 'blue');

  // Remove node_modules from each package
  packages.forEach(packageName => {
    const nodeModulesPath = path.join(packagesDir, packageName, 'node_modules');
    if (removeDirectory(nodeModulesPath)) {
      fixedCount++;
    }
  });

  // Remove lock files from each package
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  packages.forEach(packageName => {
    lockFiles.forEach(lockFile => {
      const lockFilePath = path.join(packagesDir, packageName, lockFile);
      if (removeFile(lockFilePath)) {
        fixedCount++;
      }
    });
  });

  return fixedCount;
}

function reinstallDependencies() {
  log('\n📦 Reinstalling dependencies from root...', 'blue');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependencies reinstalled successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to reinstall dependencies: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Monorepo Fix Script', 'bold');
  log('======================\n', 'blue');

  const fixedCount = fixMonorepoViolations();
  
  if (fixedCount > 0) {
    log(`\n📊 Fixed ${fixedCount} violations`, 'yellow');
    
    if (reinstallDependencies()) {
      log('\n✅ Monorepo violations have been fixed!', 'green');
      log('💡 Run "npm run guard" to verify the fixes.', 'blue');
    } else {
      log('\n❌ Failed to reinstall dependencies', 'red');
      process.exit(1);
    }
  } else {
    log('\n✅ No monorepo violations found to fix.', 'green');
  }

  log('\n📚 Next Steps:', 'yellow');
  log('1. Run: npm run guard', 'blue');
  log('2. Run: npm run lint', 'blue');
  log('3. Commit your changes', 'blue');
}

// Run the fix
main(); 