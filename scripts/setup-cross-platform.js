#!/usr/bin/env node

/**
 * Cross-Platform Monorepo Setup Script
 * 
 * This script ensures that the monorepo works correctly on Windows, macOS, and Linux
 * by setting up the proper git hooks and validating the environment.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform OS detection
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

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

function checkNodeVersion() {
  log('\n🔍 Checking Node.js version...', 'blue');
  
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✅ Node.js ${nodeVersion} (compatible)`, 'green');
      return true;
    } else {
      log(`❌ Node.js ${nodeVersion} (requires >= 18.0.0)`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to check Node.js version: ${error.message}`, 'red');
    return false;
  }
}

function checkNpmVersion() {
  log('\n🔍 Checking npm version...', 'blue');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    if (majorVersion >= 9) {
      log(`✅ npm ${npmVersion} (compatible with workspaces)`, 'green');
      return true;
    } else {
      log(`❌ npm ${npmVersion} (requires >= 9.0.0 for proper workspace support)`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to check npm version: ${error.message}`, 'red');
    return false;
  }
}

function checkGitHooks() {
  log('\n🔍 Checking git hooks setup...', 'blue');
  
  const huskyDir = path.join(process.cwd(), '.husky');
  const preCommitPath = path.join(huskyDir, 'pre-commit');
  const prePushPath = path.join(huskyDir, 'pre-push');
  
  let hooksValid = true;
  
  if (!fs.existsSync(huskyDir)) {
    log('❌ .husky directory not found', 'red');
    hooksValid = false;
  } else {
    log('✅ .husky directory exists', 'green');
  }
  
  if (!fs.existsSync(preCommitPath)) {
    log('❌ pre-commit hook not found', 'red');
    hooksValid = false;
  } else {
    try {
      const stats = fs.statSync(preCommitPath);
      if (stats.mode & parseInt('111', 8)) {
        log('✅ pre-commit hook is executable', 'green');
      } else {
        log('⚠️  pre-commit hook needs execute permissions', 'yellow');
        if (!isWindows) {
          fs.chmodSync(preCommitPath, '0755');
          log('✅ Fixed pre-commit hook permissions', 'green');
        }
      }
    } catch (error) {
      log(`❌ Error checking pre-commit hook: ${error.message}`, 'red');
      hooksValid = false;
    }
  }
  
  if (!fs.existsSync(prePushPath)) {
    log('❌ pre-push hook not found', 'red');
    hooksValid = false;
  } else {
    try {
      const stats = fs.statSync(prePushPath);
      if (stats.mode & parseInt('111', 8)) {
        log('✅ pre-push hook is executable', 'green');
      } else {
        log('⚠️  pre-push hook needs execute permissions', 'yellow');
        if (!isWindows) {
          fs.chmodSync(prePushPath, '0755');
          log('✅ Fixed pre-push hook permissions', 'green');
        }
      }
    } catch (error) {
      log(`❌ Error checking pre-push hook: ${error.message}`, 'red');
      hooksValid = false;
    }
  }
  
  return hooksValid;
}

function testGuardScript() {
  log('\n🔍 Testing monorepo guard script...', 'blue');
  
  try {
    execSync('node scripts/monorepo-guard.js', { stdio: 'pipe' });
    log('✅ Monorepo guard script runs successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Monorepo guard script failed', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function showPlatformSpecificInstructions() {
  const platformName = isWindows ? 'Windows' : (isMac ? 'macOS' : (isLinux ? 'Linux' : platform));
  
  log(`\n📋 Platform-Specific Instructions for ${platformName}:`, 'yellow');
  
  if (isWindows) {
    log('\n🪟 Windows Users:', 'blue');
    log('• Ensure Git Bash is installed for shell script compatibility', 'blue');
    log('• Use Git Bash, PowerShell, or Command Prompt', 'blue');
    log('• Scripts will automatically detect Windows and show appropriate commands', 'blue');
    log('• Windows batch files (.cmd) are available as alternatives', 'blue');
  } else if (isMac) {
    log('\n🍎 macOS Users:', 'blue');
    log('• Use Terminal or any shell (bash, zsh, fish)', 'blue');
    log('• All Unix commands work natively', 'blue');
    log('• Homebrew recommended for managing Node.js versions', 'blue');
  } else {
    log('\n🐧 Linux Users:', 'blue');
    log('• Use any shell (bash, zsh, fish)', 'blue');
    log('• All Unix commands work natively', 'blue');
    log('• Use your package manager (apt, yum, pacman) for Node.js', 'blue');
  }
}

function main() {
  log('🚀 Cross-Platform Monorepo Setup Validator', 'bold');
  log('==========================================\n', 'blue');
  
  const platformName = isWindows ? 'Windows' : (isMac ? 'macOS' : (isLinux ? 'Linux' : platform));
  log(`🌐 Detected Platform: ${platformName}`, 'blue');
  
  let allChecksPass = true;
  
  // Run all validation checks
  allChecksPass = checkNodeVersion() && allChecksPass;
  allChecksPass = checkNpmVersion() && allChecksPass;
  allChecksPass = checkGitHooks() && allChecksPass;
  allChecksPass = testGuardScript() && allChecksPass;
  
  if (allChecksPass) {
    log('\n✅ All checks passed! Your monorepo is ready for cross-platform development.', 'green');
    log('🎉 The architecture guard will work on Windows, macOS, and Linux.', 'green');
  } else {
    log('\n❌ Some checks failed. Please address the issues above.', 'red');
    showPlatformSpecificInstructions();
    process.exit(1);
  }
  
  log('\n📚 Available Commands:', 'yellow');
  log('• npm run guard - Check monorepo architecture', 'blue');
  log('• npm run guard:fix - Fix monorepo violations automatically', 'blue');
  log('• npm run dev - Start development (all platforms)', 'blue');
  log('• npm run build - Build all packages (all platforms)', 'blue');
}

// Run the setup validation
main();