#!/bin/bash

# Test Summary Script for Stellar Insured Frontend

echo "🧪 Stellar Insured Frontend - Test Suite Summary"
echo "=================================================="
echo ""

# Run tests and capture output
echo "📊 Running test suite..."
npm test -- --passWithNoTests --silent 2>&1 > /tmp/test-output.txt

# Extract summary
echo ""
echo "📈 Test Results:"
grep "Test Suites:" /tmp/test-output.txt
grep "Tests:" /tmp/test-output.txt
echo ""

# Count test files
TEST_FILES=$(find src -name "*.test.tsx" -o -name "*.test.ts" | wc -l)
echo "📁 Total Test Files: $TEST_FILES"
echo ""

# List test categories
echo "📂 Test Categories:"
echo "  - Unit Tests: $(find src/components src/lib -name "*.test.tsx" -o -name "*.test.ts" | wc -l)"
echo "  - Integration Tests: $(find src/app -name "*.test.tsx" | wc -l)"
echo ""

# Run coverage
echo "📊 Generating coverage report..."
npm run test:coverage -- --silent 2>&1 > /tmp/coverage-output.txt

# Show coverage summary
echo ""
echo "📈 Coverage Summary:"
grep -A 10 "Coverage summary" /tmp/coverage-output.txt || echo "Coverage report generated. Run 'npm run test:coverage' for details."

echo ""
echo "✅ Test suite execution complete!"
echo ""
echo "Commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:watch    - Run tests in watch mode"
echo "  npm run test:coverage - Generate coverage report"
