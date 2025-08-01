#!/usr/bin/env node

/**
 * Monorepo Fix Script
 * 
 * This script automatically fixes monorepo architecture violations
 * by removing node_modules and lock files from individual packages.
 * 
 * Cross-platform compatible (Windows, macOS, Linux)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import os from 'os';

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

function getOSInfo() {
  const platform = os.platform();
  const isWindows = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform === 'linux';
  
  return { platform, isWindows, isMac, isLinux };
}

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  try {
    // Use cross-platform fs.rmSync with proper options
    fs.rmSync(dirPath, { 
      recursive: true, 
      force: true,
      maxRetries: 3,
      retryDelay: 100
    });
    
    const relativePath = path.relative(process.cwd(), dirPath);
    log(`✅ Removed: ${relativePath}`, 'green');
    return true;
  } catch (error) {
    const { isWindows } = getOSInfo();
    
    // Try alternative methods for stubborn directories
    try {
      if (isWindows) {
        // Use Windows-specific command for stubborn directories
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
      } else {
        // Use Unix-specific command for stubborn directories
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
      }
      
      const relativePath = path.relative(process.cwd(), dirPath);
      log(`✅ Removed (force): ${relativePath}`, 'green');
      return true;
    } catch (forceError) {
      log(`❌ Failed to remove ${dirPath}: ${error.message}`, 'red');
      log(`💡 Try manually: ${isWindows ? `rmdir /s /q "${dirPath}"` : `rm -rf "${dirPath}"`}`, 'yellow');
      return false;
    }
  }
}

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    fs.unlinkSync(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    log(`✅ Removed: ${relativePath}`, 'green');
    return true;
  } catch (error) {
    const { isWindows } = getOSInfo();
    
    // Try alternative methods for stubborn files
    try {
      if (isWindows) {
        execSync(`del /f /q "${filePath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -f "${filePath}"`, { stdio: 'ignore' });
      }
      
      const relativePath = path.relative(process.cwd(), filePath);
      log(`✅ Removed (force): ${relativePath}`, 'green');
      return true;
    } catch (forceError) {
      log(`❌ Failed to remove ${filePath}: ${error.message}`, 'red');
      log(`💡 Try manually: ${isWindows ? `del /f /q "${filePath}"` : `rm -f "${filePath}"`}`, 'yellow');
      return false;
    }
  }
}

function fixMonorepoViolations() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = ['client', 'server', 'shared'];
  let fixedCount = 0;
  const { platform } = getOSInfo();

  log(`🔧 Fixing monorepo violations on ${platform}...`, 'blue');

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
    // Use cross-platform npm install
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log('✅ Dependencies reinstalled successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to reinstall dependencies: ${error.message}`, 'red');
    log('💡 Try running "npm install" manually', 'yellow');
    return false;
  }
}

function showManualCommands() {
  const { isWindows } = getOSInfo();
  
  log('\n🔧 Manual Commands (if automatic fix fails):', 'yellow');
  
  if (isWindows) {
    log('Windows Commands:', 'blue');
    log('  rmdir /s /q packages\\client\\node_modules', 'blue');
    log('  rmdir /s /q packages\\server\\node_modules', 'blue');
    log('  rmdir /s /q packages\\shared\\node_modules', 'blue');
    log('  del packages\\*\\package-lock.json packages\\*\\yarn.lock packages\\*\\pnpm-lock.yaml', 'blue');
    log('  npm install', 'blue');
  } else {
    log('Unix/Mac Commands:', 'blue');
    log('  rm -rf packages/*/node_modules', 'blue');
    log('  rm -f packages/*/package-lock.json packages/*/yarn.lock packages/*/pnpm-lock.yaml', 'blue');
    log('  npm install', 'blue');
  }
}

function main() {
  log('🚀 Monorepo Fix Script', 'bold');
  log('======================\n', 'blue');

  const { platform, isWindows, isMac, isLinux } = getOSInfo();
  log(`🌐 Operating System: ${platform}`, 'blue');

  const fixedCount = fixMonorepoViolations();
  
  if (fixedCount > 0) {
    log(`\n📊 Fixed ${fixedCount} violations`, 'yellow');
    
    if (reinstallDependencies()) {
      log('\n✅ Monorepo violations have been fixed!', 'green');
      log('💡 Run "npm run guard" to verify the fixes.', 'blue');
    } else {
      log('\n❌ Failed to reinstall dependencies', 'red');
      showManualCommands();
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