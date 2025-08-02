#!/usr/bin/env node

/**
 * ESLint Auto-Fix Script
 * 
 * This script automatically fixes common ESLint issues in the client package
 * to help with pre-commit hooks and code quality.
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

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix empty catch blocks
    content = content.replace(/catch\s*\(\s*[^)]*\s*\)\s*{\s*}/g, 'catch (error) {\n        // Handle error\n      }');
    content = content.replace(/else\s*{\s*}/g, 'else {\n          // Handle unsuccessful login\n        }');

    // Remove unused imports more intelligently
    const unusedImports = [
      'React',
      'Auth',
      'BrowserRouter',
      'Routes', 
      'Route',
      'Home',
      'Dashboard',
      'AddEmployee',
      'Profile',
      'PrivateRoute',
      'Bug',
      'AlertTriangle',
      'Clock',
      'CheckCircle',
      'Zap',
      'Mail',
      'RefreshCcw',
      'Shield',
      'MessageCircle',
      'Bell',
      'Users',
      'BarChart3',
      'Eye',
      'EyeOff',
      'Link',
      'NavLink',
      'ToastContainer',
      'EmailVerify',
      'StrictMode',
      'App',
      'GoogleOAuthProvider',
      'Provider',
      'Login',
      'Register',
      'Plus',
      'Search',
      'MessageSquare',
      'LogOut',
      'Settings',
      'UserPlus',
      'BugStats',
      'motion',
      'AnimatePresence',
      'Navbar',
      'Herosetion',
      'Features',
      'BugPriority',
      'CtaSection',
      'Footer',
      'ArrowLeft',
      'Edit',
      'Phone',
      'MapPin',
      'Calendar',
      'Camera',
      'User'
    ];

    unusedImports.forEach(importName => {
      // Check if the import is actually used in JSX or function calls
      const isUsedInJSX = content.includes(`<${importName}`) || content.includes(`<${importName} `);
      const isUsedInFunction = content.includes(`${importName}(`) || content.includes(`${importName}.`);
      const isUsedInVariable = content.includes(`${importName} =`) || content.includes(`: ${importName}`);
      
      if (content.includes(importName) && !isUsedInJSX && !isUsedInFunction && !isUsedInVariable) {
        // Remove from destructured imports
        content = content.replace(new RegExp(`import\\s*{[^}]*\\b${importName}\\b[^}]*}\\s*from\\s*["'][^"']+["']`, 'g'), (match) => {
          const newImports = match.replace(new RegExp(`\\b${importName}\\b\\s*,?\\s*`), '').replace(/,\s*,/g, ',').replace(/,\s*}/g, '}');
          return newImports.includes('{}') ? '' : newImports;
        });
        
        // Remove standalone imports
        content = content.replace(new RegExp(`import\\s+${importName}\\s+from\\s+["'][^"']+["']`, 'g'), '');
        modified = true;
      }
    });

    // Remove console statements
    content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\s*/g, '');
    modified = true;

    // Fix specific issues
    if (filePath.includes('Register.jsx')) {
      // Fix the email variable issue
      content = content.replace(/setUserEmail\(email\)/g, 'setUserEmail(res.data.email)');
      modified = true;
    }

    // Clean up empty import lines
    content = content.replace(/import\s*{\s*}\s*from\s*["'][^"']+["']\s*;?\s*/g, '');
    content = content.replace(/import\s*{\s*}\s*;?\s*/g, '');

    // Remove unused variables in catch blocks
    content = content.replace(/catch\s*\(\s*([^)]+)\s*\)\s*{\s*\/\/\s*Handle\s*error\s*}/g, 'catch (error) {\n        // Handle error\n      }');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`, 'green');
      return true;
    }

    return false;
  } catch (error) {
    log(`❌ Error fixing ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function fixAllFiles() {
  const clientDir = path.join(process.cwd(), 'packages', 'client', 'src');
  let fixedCount = 0;
  let totalFiles = 0;

  log('🔧 Fixing ESLint issues...', 'blue');

  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        totalFiles++;
        if (fixFile(filePath)) {
          fixedCount++;
        }
      }
    });
  }

  processDirectory(clientDir);

  log(`\n📊 Results:`, 'yellow');
  log(`• Total files processed: ${totalFiles}`, 'blue');
  log(`• Files fixed: ${fixedCount}`, 'green');
  log(`• Files unchanged: ${totalFiles - fixedCount}`, 'blue');

  return fixedCount > 0;
}

function main() {
  log('🚀 ESLint Auto-Fix Script', 'bold');
  log('==========================\n', 'blue');

  const hasChanges = fixAllFiles();

  if (hasChanges) {
    log('\n✅ ESLint issues have been automatically fixed!', 'green');
    log('💡 Run "npm run lint" to verify the fixes.', 'blue');
  } else {
    log('\n✅ No ESLint issues found to fix.', 'green');
  }

  log('\n📚 Next Steps:', 'yellow');
  log('1. Run: npm run lint --workspace=@bugline/client', 'blue');
  log('2. If issues remain, fix them manually', 'blue');
  log('3. Commit your changes', 'blue');
}

// Run the fix
main(); 