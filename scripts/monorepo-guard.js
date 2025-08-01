#!/usr/bin/env node

/**
 * Monorepo Architecture Guard
 * 
 * This script prevents developers from installing node_modules in individual packages
 * and enforces the monorepo architecture. It should be run as a pre-commit hook.
 * 
 * Cross-platform compatible: Windows, macOS, Linux
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
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

function checkMonorepoArchitecture() {
  const packagesDir = path.join(process.cwd(), 'packages');  
  let hasViolations = false;
  let violations = [];

  log('🔍 Checking monorepo architecture...', 'blue');

  // Dynamically discover packages
  const packages = fs.existsSync(packagesDir) ? 
    fs.readdirSync(packagesDir).filter(item => {
      const itemPath = path.join(packagesDir, item);
      return fs.statSync(itemPath).isDirectory();
    }) : [];

  if (packages.length === 0) {
    hasViolations = true;
    violations.push('❌ No packages found in packages/ directory');
    return { hasViolations, violations };
  }

  // Check each package for node_modules
  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const nodeModulesPath = path.join(packagePath, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      const stats = fs.statSync(nodeModulesPath);
      if (stats.isDirectory()) {
        const contents = fs.readdirSync(nodeModulesPath);
        
        // Check if this package has dependencies in its package.json
        const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
        let hasDependencies = false;
        
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            hasDependencies = (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) ||
                            (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0);
          } catch (error) {
            hasDependencies = true;
          }
        }
        
        if (contents.length > 0) {
          // Check if this is due to version conflicts (which indicates dependency management issues)
          const hasVersionConflicts = contents.some(item => {
            try {
              const itemPath = path.join(nodeModulesPath, item);
              const itemStats = fs.lstatSync(itemPath);
              return !itemStats.isSymbolicLink() && itemStats.isDirectory();
            } catch (error) {
              return false;
            }
          });
          
          if (hasVersionConflicts) {
            hasViolations = true;
            log(`❌ ${packageName}/ - Contains node_modules due to dependency conflicts (VIOLATION)`, 'red');
            violations.push(`❌ ${packageName}/node_modules found - likely due to dependency version conflicts`);
            violations.push(`   📦 Contains ${contents.length} items - indicates version conflicts that prevent hoisting`);
            violations.push(`   🔧 Fix: Standardize dependency versions across packages to enable proper hoisting`);
          } else {
            log(`✅ ${packageName}/ - Contains workspace symlinks only (legitimate)`, 'green');
          }
        }
      }
    } else {
      log(`✅ ${packageName}/ - No node_modules found (correct)`, 'green');
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
  log('\n🔧 IMMEDIATE REMEDIATION STEPS:', 'red');
  log('==========================================', 'red');
  
  log('\n1. ⚠️  STOP - Do not commit until violations are fixed!', 'red');
  
  log('\n2. Fix dependency version conflicts (root cause):', 'yellow');
  log('   # Standardize ESLint versions across all packages:', 'blue');
  log('   # 1. Choose one ESLint version (e.g., latest 9.x)', 'blue');
  log('   # 2. Update all package.json files to use the same version', 'blue');
  log('   # 3. Update eslint configs to be compatible', 'blue');
  
  log('\n3. Clean up after version standardization:', 'yellow');
  if (isWindows) {
    log('   # Windows Commands:', 'blue');
    log('   rmdir /s /q packages\\client\\node_modules', 'blue');
    log('   rmdir /s /q packages\\server\\node_modules', 'blue');
    log('   rmdir /s /q packages\\shared\\node_modules', 'blue');
  } else {
    log('   # Unix/Mac/Linux Commands:', 'blue');
    log('   rm -rf packages/*/node_modules', 'blue');
  }
  
  log('\n4. Remove individual lock files:', 'yellow');
  if (isWindows) {
    log('   # Windows:', 'blue');
    log('   del packages\\*\\package-lock.json packages\\*\\yarn.lock packages\\*\\pnpm-lock.yaml', 'blue');
  } else {
    log('   # Unix/Mac/Linux:', 'blue');
    log('   rm -f packages/*/package-lock.json packages/*/yarn.lock packages/*/pnpm-lock.yaml', 'blue');
  }
  
  log('\n5. Clean root and reinstall properly:', 'yellow');
  if (isWindows) {
    log('   rmdir /s /q node_modules', 'blue');
    log('   del package-lock.json', 'blue');  
  } else {
    log('   rm -rf node_modules package-lock.json', 'blue');
  }
  log('   npm install', 'blue');
  
  log('\n6. Verify fix by running guard again:', 'yellow');
  log('   npm run guard', 'blue');
  
  log('\n7. Use proper workspace commands going forward:', 'yellow');
  log('   npm run dev --workspace=@bugline/client', 'blue');
  log('   npm run build --workspace=@bugline/server', 'blue');
  log('   npm install <package> --workspace=@bugline/client', 'blue');
  
  log('\n📚 MONOREPO RULES (DO NOT BREAK THESE):', 'red');
  log('======================================', 'red');
  log('• NEVER run npm install inside packages/', 'red');
  log('• ALWAYS run npm install from root directory', 'red');
  log('• NO packages should ever have their own node_modules', 'red');
  log('• NO packages should have package-lock.json files', 'red');
  log('• Use workspace commands for package-specific operations', 'red');
  log('• All dependencies are managed at the root level', 'red');
  
  log('\n💡 Why this architecture matters:', 'yellow');
  log('• Prevents dependency version conflicts', 'blue');
  log('• Reduces disk space and installation time', 'blue');
  log('• Ensures consistent dependency versions across packages', 'blue');
  log('• Enables proper hoisting and deduplication', 'blue');
  log('• Makes dependency management predictable and maintainable', 'blue');
}

function main() {
  log('🚀 Monorepo Architecture Guard', 'bold');
  log('=====================================\n', 'blue');
  
  // Show platform for debugging
  const platformName = isWindows ? 'Windows' : (isMac ? 'macOS' : (isLinux ? 'Linux' : platform));
  log(`🌐 Platform: ${platformName}`, 'blue');

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