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

function analyzeDependencyConflicts() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = fs.existsSync(packagesDir) ? 
    fs.readdirSync(packagesDir).filter(item => {
      const itemPath = path.join(packagesDir, item);
      return fs.statSync(itemPath).isDirectory();
    }) : [];

  const allDependencies = new Map();
  const conflicts = new Map();

  // Collect all dependencies from all packages
  packages.forEach(packageName => {
    const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Process both dependencies and devDependencies
        ['dependencies', 'devDependencies'].forEach(depType => {
          if (packageJson[depType]) {
            Object.entries(packageJson[depType]).forEach(([depName, version]) => {
              if (!allDependencies.has(depName)) {
                allDependencies.set(depName, new Map());
              }
              allDependencies.get(depName).set(packageName, { version, type: depType });
            });
          }
        });
      } catch (error) {
        log(`❌ Failed to read ${packageName}/package.json: ${error.message}`, 'red');
      }
    }
  });

  // Find conflicts (same dependency with different versions)
  allDependencies.forEach((packageVersions, depName) => {
    const versions = new Set();
    packageVersions.forEach(({ version }) => versions.add(version));
    
    if (versions.size > 1) {
      conflicts.set(depName, packageVersions);
    }
  });

  return { conflicts, packages };
}

function resolveVersionConflicts(conflicts) {
  log('\n🔍 Analyzing dependency conflicts...', 'blue');
  
  if (conflicts.size === 0) {
    log('✅ No version conflicts found!', 'green');
    return 0;
  }

  log(`📊 Found ${conflicts.size} dependency conflicts:`, 'yellow');
  
  let fixedCount = 0;
  const resolutions = new Map();

  conflicts.forEach((packageVersions, depName) => {
    log(`\n🔧 Resolving conflict for "${depName}":`, 'blue');
    
    // Collect all versions and choose the highest semantic version
    const versions = Array.from(packageVersions.values()).map(v => v.version);
    const latestVersion = chooseLatestVersion(versions);
    
    packageVersions.forEach(({ version, type }, packageName) => {
      log(`  📦 ${packageName}: ${version} (${type})`, version === latestVersion ? 'green' : 'yellow');
    });
    
    log(`  ✅ Resolution: Use ${latestVersion}`, 'green');
    resolutions.set(depName, { version: latestVersion, packages: packageVersions });
    fixedCount++;
  });

  // Apply the resolutions
  applyVersionResolutions(resolutions);
  
  return fixedCount;
}

function chooseLatestVersion(versions) {
  // Simple version comparison - prioritize the highest version
  // This handles basic semver without external dependencies
  return versions.sort((a, b) => {
    const aClean = a.replace(/[^\d.]/g, '');
    const bClean = b.replace(/[^\d.]/g, '');
    const aParts = aClean.split('.').map(Number);
    const bParts = bClean.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      if (aPart !== bPart) {
        return bPart - aPart; // Sort descending (latest first)
      }
    }
    return 0;
  })[0];
}

function applyVersionResolutions(resolutions) {
  log('\n📝 Updating package.json files...', 'blue');
  
  const packagesDir = path.join(process.cwd(), 'packages');
  
  resolutions.forEach(({ version, packages }, depName) => {
    packages.forEach(({ type }, packageName) => {
      const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (packageJson[type] && packageJson[type][depName]) {
          const oldVersion = packageJson[type][depName];
          packageJson[type][depName] = version;
          
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
          log(`  ✅ Updated ${packageName}/${depName}: ${oldVersion} → ${version}`, 'green');
        }
      } catch (error) {
        log(`  ❌ Failed to update ${packageName}: ${error.message}`, 'red');
      }
    });
  });
}

function fixMonorepoViolations() {
  const packagesDir = path.join(process.cwd(), 'packages');
  let fixedCount = 0;
  const { platform } = getOSInfo();

  log(`🔧 Fixing monorepo violations on ${platform}...`, 'blue');

  // Step 1: Resolve dependency conflicts first
  const { conflicts, packages } = analyzeDependencyConflicts();
  const conflictsFix = resolveVersionConflicts(conflicts);
  fixedCount += conflictsFix;

  if (packages.length === 0) {
    log('❌ No packages found in packages/ directory', 'red');
    return fixedCount;
  }

  // Step 2: Remove ALL node_modules from packages
  packages.forEach(packageName => {
    const nodeModulesPath = path.join(packagesDir, packageName, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      log(`🗑️  Removing ${packageName}/node_modules`, 'yellow');
      if (removeDirectory(nodeModulesPath)) {
        fixedCount++;
      }
    } else {
      log(`✅ ${packageName}/ - No node_modules to remove`, 'green');
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

function handleProblematicDependencies() {
  log('\n🔧 Handling problematic dependencies...', 'blue');
  
  const serverPackageJsonPath = path.join(process.cwd(), 'packages', 'server', 'package.json');
  
  if (fs.existsSync(serverPackageJsonPath)) {
    try {
      const serverPackageJson = JSON.parse(fs.readFileSync(serverPackageJsonPath, 'utf8'));
      
      // Remove eslint-config-node which brings in old ESLint versions and is problematic
      if (serverPackageJson.devDependencies && serverPackageJson.devDependencies['eslint-config-node']) {
        log('  🗑️  Removing problematic eslint-config-node from server', 'yellow');
        delete serverPackageJson.devDependencies['eslint-config-node'];
        
        // Add a modern ESLint config instead
        if (!serverPackageJson.devDependencies['@eslint/js']) {
          serverPackageJson.devDependencies['@eslint/js'] = '^9.30.1';
          log('  ✅ Added @eslint/js as modern replacement', 'green');
        }
        
        fs.writeFileSync(serverPackageJsonPath, JSON.stringify(serverPackageJson, null, 2) + '\n');
        log('  ✅ Updated server/package.json', 'green');
        
        return 1;
      }
    } catch (error) {
      log(`  ❌ Failed to update server package.json: ${error.message}`, 'red');
    }
  }
  
  return 0;
}

function main() {
  log('🚀 Monorepo Fix Script', 'bold');
  log('======================\n', 'blue');

  const { platform } = getOSInfo();
  log(`🌐 Operating System: ${platform}`, 'blue');

  let totalFixed = 0;
  
  // Step 1: Handle problematic dependencies that cause conflicts
  totalFixed += handleProblematicDependencies();
  
  // Step 2: Fix standard monorepo violations and conflicts
  totalFixed += fixMonorepoViolations();
  
  if (totalFixed > 0) {
    log(`\n📊 Fixed ${totalFixed} issues total`, 'yellow');
    
    if (reinstallDependencies()) {
      log('\n✅ Monorepo violations and conflicts resolved!', 'green');
      log('💡 All dependencies should now be properly hoisted to save space.', 'green');
      log('🚀 Run "npm run guard" to verify the fixes.', 'blue');
    } else {
      log('\n❌ Failed to reinstall dependencies', 'red');
      showManualCommands();
      process.exit(1);
    }
  } else {
    log('\n✅ No monorepo violations or conflicts found!', 'green');
  }

  log('\n📚 Next Steps:', 'yellow');
  log('1. Run: npm run guard', 'blue');
  log('2. Run: npm run lint (may need config updates)', 'blue');
  log('3. Test your applications', 'blue');
  log('4. Commit your changes', 'blue');
}

// Run the fix
main(); 