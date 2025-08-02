@echo off
echo 🔍 Running final monorepo architecture check before push...
node scripts/monorepo-guard.js

if %errorlevel% neq 0 (
  echo.
  echo ❌ PUSH BLOCKED: Monorepo architecture violations detected!
  echo 📋 Fix the violations above before pushing.
  exit /b 1
)

echo ✅ Monorepo architecture check passed!