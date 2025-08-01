#!/usr/bin/env node

/**
 * Monorepo Architecture Guard
 * 
 * This script prevents developers from installing node_modules in individual packages
 * and enforces the monorepo architecture. It should be run as a pre-commit hook.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function checkMonorepoArchitecture() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = ['client', 'server', 'shared'];
  let hasViolations = false;
  let violations = [];

  log('🔍 Checking monorepo architecture...', 'blue');

  // Check each package for node_modules
  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const nodeModulesPath = path.join(packagePath, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      hasViolations = true;
      violations.push(`❌ ${packageName}/node_modules found`);
      
      // Check if it's a directory with content
      const stats = fs.statSync(nodeModulesPath);
      if (stats.isDirectory()) {
        const contents = fs.readdirSync(nodeModulesPath);
        if (contents.length > 0) {
          violations.push(`   📦 Contains ${contents.length} items`);
        }
      }
    } else {
      log(`✅ ${packageName}/ - No node_modules found`, 'green');
    }
  });

  // Check for package-lock.json in individual packages
  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const packageLockPath = path.join(packagePath, 'package-lock.json');
    
    if (fs.existsSync(packageLockPath)) {
      hasViolations = true;
      violations.push(`❌ ${packageName}/package-lock.json found`);
    }
  });

  // Check for yarn.lock in individual packages
  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const yarnLockPath = path.join(packagePath, 'yarn.lock');
    
    if (fs.existsSync(yarnLockPath)) {
      hasViolations = true;
      violations.push(`❌ ${packageName}/yarn.lock found`);
    }
  });

  // Check for pnpm-lock.yaml in individual packages
  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const pnpmLockPath = path.join(packagePath, 'pnpm-lock.yaml');
    
    if (fs.existsSync(pnpmLockPath)) {
      hasViolations = true;
      violations.push(`❌ ${packageName}/pnpm-lock.yaml found`);
    }
  });

  // Check if root has proper workspace configuration
  const rootPackageJson = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(rootPackageJson)) {
    const rootPackage = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
    
    if (!rootPackage.workspaces || !rootPackage.workspaces.includes('packages/*')) {
      hasViolations = true;
      violations.push('❌ Root package.json missing proper workspace configuration');
    } else {
      log('✅ Root workspace configuration is correct', 'green');
    }
  }

  // Check if shared package exists and is properly configured
  const sharedPackagePath = path.join(packagesDir, 'shared', 'package.json');
  if (!fs.existsSync(sharedPackagePath)) {
    hasViolations = true;
    violations.push('❌ Shared package missing');
  } else {
    log('✅ Shared package exists', 'green');
  }

  // Check if .config directory exists
  const configDir = path.join(process.cwd(), '.config');
  if (!fs.existsSync(configDir)) {
    hasViolations = true;
    violations.push('❌ .config directory missing (shared configurations)');
  } else {
    log('✅ Shared configurations exist', 'green');
  }

  return { hasViolations, violations };
}

function showRemediationSteps() {
  log('\n🔧 Remediation Steps:', 'yellow');
  log('1. Remove node_modules from individual packages:', 'yellow');
  log('   rm -rf packages/*/node_modules', 'blue');
  log('2. Remove lock files from individual packages:', 'yellow');
  log('   rm -f packages/*/package-lock.json packages/*/yarn.lock packages/*/pnpm-lock.yaml', 'blue');
  log('3. Install dependencies from root:', 'yellow');
  log('   npm install', 'blue');
  log('4. Use workspace commands for package-specific operations:', 'yellow');
  log('   npm run dev --workspace=@bugline/client', 'blue');
  log('   npm run lint --workspace=@bugline/server', 'blue');
  log('\n📚 Monorepo Best Practices:', 'yellow');
  log('• Always run npm install from the root directory', 'blue');
  log('• Use workspace commands for package-specific operations', 'blue');
  log('• Share common dependencies through the shared package', 'blue');
  log('• Use shared configurations in .config/ directory', 'blue');
}

function main() {
  log('🚀 Monorepo Architecture Guard', 'bold');
  log('=====================================\n', 'blue');

  const { hasViolations, violations } = checkMonorepoArchitecture();

  if (hasViolations) {
    log('\n❌ Monorepo Architecture Violations Detected:', 'red');
    violations.forEach(violation => {
      log(violation, 'red');
    });
    
    showRemediationSteps();
    
    log('\n💡 Why this matters:', 'yellow');
    log('• Prevents dependency duplication', 'blue');
    log('• Ensures consistent dependency versions', 'blue');
    log('• Maintains clean monorepo structure', 'blue');
    log('• Enables proper workspace management', 'blue');
    
    process.exit(1);
  } else {
    log('\n✅ Monorepo architecture is clean!', 'green');
    log('🎉 All packages follow the monorepo best practices.', 'green');
  }
}

// Run the check
main(); 