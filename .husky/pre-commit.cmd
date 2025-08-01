@echo off
echo 🔍 Checking monorepo architecture compliance...
node scripts/monorepo-guard.js

if %errorlevel% neq 0 (
  echo.
  echo ❌ COMMIT BLOCKED: Monorepo architecture violations detected!
  echo 📋 Fix the violations above before committing.
  exit /b 1
)

echo ✅ Monorepo architecture check passed!