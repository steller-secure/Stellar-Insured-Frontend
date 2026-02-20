#!/bin/bash

# CI/CD Setup Script for Stellar Insured Frontend
# This script helps configure GitHub repository settings for CI/CD

set -e

echo "🚀 Stellar Insured CI/CD Setup"
echo "================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_desc=$2
    
    echo "🔐 Setting secret: $secret_name"
    echo "   Description: $secret_desc"
    read -sp "   Enter value (hidden): " secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo "   ✅ Secret set successfully"
    else
        echo "   ⚠️  Skipped (empty value)"
    fi
    echo ""
}

# Set repository secrets
echo "📝 Setting up repository secrets..."
echo "   (Press Enter to skip any secret)"
echo ""

set_secret "VERCEL_TOKEN" "Vercel authentication token"
set_secret "VERCEL_ORG_ID" "Vercel organization ID"
set_secret "VERCEL_PROJECT_ID" "Vercel project ID"
set_secret "STAGING_API_BASE_URL" "Staging API base URL"
set_secret "PRODUCTION_API_BASE_URL" "Production API base URL"
set_secret "CODECOV_TOKEN" "Codecov token (optional)"

echo "✅ Secrets configuration complete"
echo ""

# Create environments
echo "🌍 Creating GitHub Environments..."

gh api repos/$REPO/environments/staging -X PUT -f deployment_branch_policy='{"protected_branches":false,"custom_branch_policies":true}' 2>/dev/null || echo "   ℹ️  Staging environment may already exist"

gh api repos/$REPO/environments/production -X PUT -f deployment_branch_policy='{"protected_branches":true,"custom_branch_policies":false}' 2>/dev/null || echo "   ℹ️  Production environment may already exist"

echo "✅ Environments created"
echo ""

# Branch protection
echo "🛡️  Setting up branch protection..."
echo "   Note: Some settings require admin access and may need manual configuration"
echo ""

# Protect main branch
gh api repos/$REPO/branches/main/protection -X PUT -f required_status_checks='{"strict":true,"contexts":["Lint & Format Check","Run Tests","Build Verification"]}' -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' -f restrictions=null 2>/dev/null && echo "   ✅ Main branch protected" || echo "   ⚠️  Could not set main branch protection (may require admin access)"

# Protect develop branch
gh api repos/$REPO/branches/develop/protection -X PUT -f required_status_checks='{"strict":true,"contexts":["Lint & Format Check","Run Tests","Build Verification"]}' -f enforce_admins=false -f required_pull_request_reviews='{"required_approving_review_count":1}' -f restrictions=null 2>/dev/null && echo "   ✅ Develop branch protected" || echo "   ⚠️  Could not set develop branch protection (may require admin access)"

echo ""
echo "✅ Branch protection configured"
echo ""

echo "🎉 CI/CD Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Install dependencies: npm install"
echo "   2. Setup Husky hooks: npm run prepare"
echo "   3. Review .github/CICD.md for detailed documentation"
echo "   4. Review .github/BRANCH_PROTECTION.md for manual settings"
echo "   5. Push changes to trigger first workflow run"
echo ""
echo "📚 Documentation:"
echo "   - CI/CD Guide: .github/CICD.md"
echo "   - Branch Protection: .github/BRANCH_PROTECTION.md"
echo ""
