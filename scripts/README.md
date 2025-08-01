# Monorepo Scripts

This directory contains scripts to maintain and enforce the monorepo architecture.

## 🛡️ Monorepo Architecture Guard

The `monorepo-guard.js` script prevents developers from breaking the monorepo architecture by:

### What it checks:
- ❌ `node_modules` directories in individual packages
- ❌ Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) in individual packages
- ❌ Missing workspace configuration in root `package.json`
- ❌ Missing shared package
- ❌ Missing shared configurations (`.config/` directory)

### When it runs:
- **Pre-commit**: Before every commit
- **Pre-push**: Before pushing to remote
- **Manual**: Run `npm run guard` anytime

### How to use:

```bash
# Check monorepo architecture
npm run guard

# Fix violations automatically
npm run guard:fix

# Run manually
node scripts/monorepo-guard.js
```

### What happens when violations are found:

1. **Commit/ Push blocked** - Git hooks prevent the operation
2. **Clear error messages** - Shows exactly what's wrong
3. **Remediation steps** - Provides commands to fix issues
4. **Best practices guide** - Explains why the rules matter

### Example output:

```
🚀 Monorepo Architecture Guard
=====================================

🔍 Checking monorepo architecture...
✅ client/ - No node_modules found
✅ server/ - No node_modules found
✅ shared/ - No node_modules found
✅ Root workspace configuration is correct
✅ Shared package exists
✅ Shared configurations exist

✅ Monorepo architecture is clean!
🎉 All packages follow the monorepo best practices.
```

### Violation example:

```
❌ Monorepo Architecture Violations Detected:
❌ server/node_modules found
   📦 Contains 13 items

🔧 Remediation Steps:
1. Remove node_modules from individual packages:
   rm -rf packages/*/node_modules
2. Remove lock files from individual packages:
   rm -f packages/*/package-lock.json packages/*/yarn.lock packages/*/pnpm-lock.yaml
3. Install dependencies from root:
   npm install
```

## 🎯 Best Practices Enforced

- **Single dependency tree**: All packages share the root `node_modules`
- **Workspace commands**: Use `npm run dev --workspace=@bugline/client`
- **Shared utilities**: Common code goes in `packages/shared/`
- **Shared configs**: ESLint, Prettier, TypeScript configs in `.config/`
- **Clean structure**: No duplicate dependencies or lock files

## 🔧 Troubleshooting

If you encounter issues:

1. **Reset everything**: `npm run reset`
2. **Fix violations**: `npm run guard:fix`
3. **Reinstall dependencies**: `npm install`
4. **Check architecture**: `npm run guard`

## 📚 Related Commands

```bash
# Monorepo management
npm run guard          # Check architecture
npm run guard:fix      # Fix violations
npm run clean:all      # Clean all build artifacts
npm run reset          # Reset everything

# Development
npm run dev:all        # Start all packages
npm run lint           # Lint all packages
npm run build:all      # Build all packages
``` # Test
