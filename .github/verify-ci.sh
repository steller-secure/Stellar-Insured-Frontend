#!/bin/bash

# CI/CD Verification Script
# Runs all CI checks locally before pushing

set -e

echo "🔍 Running CI/CD Verification Checks"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run check
run_check() {
    local name=$1
    local command=$2
    
    echo "📋 Running: $name"
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}: $name"
    else
        echo -e "${RED}❌ FAILED${NC}: $name"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# Check Node.js version
echo "🔧 Checking prerequisites..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "   Run: npm install"
    exit 1
fi

# Run checks
run_check "ESLint" "npm run lint"
run_check "TypeScript Type Check" "npx tsc --noEmit"
run_check "Jest Tests" "npm run test"
run_check "Build Verification" "npm run build"

# Summary
echo "===================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "✅ Your code is ready to push"
    echo ""
    echo "Next steps:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    echo "  git push"
    exit 0
else
    echo -e "${RED}❌ $FAILED check(s) failed${NC}"
    echo ""
    echo "Please fix the issues before pushing"
    exit 1
fi
