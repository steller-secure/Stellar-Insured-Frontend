# CI/CD Troubleshooting Guide

## Common Issues and Solutions

### 1. Workflow Not Triggering

**Problem**: GitHub Actions workflow doesn't run after push/PR

**Solutions**:
```bash
# Check workflow file syntax
cat .github/workflows/ci.yml

# Verify branch names match
git branch -a

# Check GitHub Actions is enabled
# Go to: Repository Settings → Actions → General
```

### 2. Lint Failures

**Problem**: ESLint checks fail in CI

**Solutions**:
```bash
# Run locally to see errors
npm run lint

# Fix auto-fixable issues
npx eslint --fix .

# Check ESLint config
cat eslint.config.mjs
```

### 3. Test Failures

**Problem**: Tests pass locally but fail in CI

**Solutions**:
```bash
# Run tests in CI mode
CI=true npm run test

# Check for environment-specific issues
npm run test:coverage

# Clear Jest cache
npx jest --clearCache
```

### 4. Build Failures

**Problem**: Build fails in CI

**Solutions**:
```bash
# Check environment variables
cat .env.local

# Build locally
npm run build

# Check for missing dependencies
npm ci

# Verify Node version matches CI
node -v  # Should be 18+
```

### 5. Deployment Failures

**Problem**: Vercel deployment fails

**Solutions**:
```bash
# Verify secrets are set
gh secret list

# Check Vercel token validity
# Go to: Vercel → Settings → Tokens

# Verify project IDs
# Go to: Vercel → Project Settings → General

# Check deployment logs
# Go to: GitHub Actions → Failed workflow → Deploy step
```

### 6. Pre-commit Hook Issues

**Problem**: Pre-commit hooks not running

**Solutions**:
```bash
# Reinstall Husky
npm run prepare

# Check hook permissions
ls -la .husky/pre-commit

# Make executable if needed
chmod +x .husky/pre-commit

# Test hook manually
.husky/pre-commit
```

### 7. Branch Protection Blocking Merge

**Problem**: Can't merge even though checks pass

**Solutions**:
```bash
# Verify all required checks passed
# Go to: PR → Checks tab

# Update branch with latest main/develop
git pull origin main
git push

# Check branch protection settings
# Go to: Settings → Branches → Branch protection rules
```

### 8. Secrets Not Available

**Problem**: Workflow can't access secrets

**Solutions**:
```bash
# List secrets (names only)
gh secret list

# Set missing secret
gh secret set SECRET_NAME

# Check environment restrictions
# Go to: Settings → Environments → [environment] → Secrets

# Verify secret names match workflow
grep -r "secrets\." .github/workflows/
```

### 9. Codecov Upload Fails

**Problem**: Coverage upload fails

**Solutions**:
```bash
# Verify token is set
gh secret list | grep CODECOV

# Check if token is valid
# Go to: Codecov → Settings → Repository Upload Token

# Note: This is optional and won't block CI
```

### 10. Dependabot PRs Failing

**Problem**: Dependabot PRs fail checks

**Solutions**:
```bash
# Update dependencies locally first
npm update

# Run tests
npm run test

# Check for breaking changes
npm outdated

# Review Dependabot config
cat .github/dependabot.yml
```

## Debugging Workflows

### View Workflow Logs
```bash
# Using GitHub CLI
gh run list
gh run view <run-id>
gh run view <run-id> --log

# Or visit: Repository → Actions → Select workflow run
```

### Re-run Failed Workflow
```bash
# Using GitHub CLI
gh run rerun <run-id>

# Or: Actions → Failed run → Re-run jobs
```

### Test Workflow Locally
```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act

# Run workflow locally
act pull_request

# Run specific job
act -j lint
```

## Performance Issues

### Slow CI Runs

**Solutions**:
```bash
# Enable dependency caching (already configured)
# Check cache hit rate in workflow logs

# Reduce test timeout
# Edit jest.config.js

# Run tests in parallel (already enabled)
```

### Build Taking Too Long

**Solutions**:
```bash
# Check for large dependencies
npm ls --depth=0

# Analyze bundle size
npm run build -- --analyze

# Consider build caching
```

## Emergency Procedures

### Disable CI Temporarily

```bash
# Disable workflow
# Go to: Actions → Select workflow → ⋯ → Disable workflow

# Or skip CI in commit message
git commit -m "fix: urgent fix [skip ci]"
```

### Force Merge (Emergency Only)

```bash
# Requires admin access
# Go to: PR → Merge → Override branch protection

# Or temporarily disable protection
# Settings → Branches → Edit rule → Disable temporarily
```

### Rollback Deployment

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin main

# Option 2: Redeploy previous version
git checkout <previous-tag>
git push origin main --force

# Option 3: Vercel dashboard
# Vercel → Deployments → Previous → Promote
```

## Getting Help

### Check Workflow Status
```bash
# View recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>
```

### Validate Workflow Files
```bash
# Use actionlint
# https://github.com/rhysd/actionlint
actionlint .github/workflows/*.yml
```

### Contact Support

- GitHub Actions: https://github.com/contact
- Vercel: https://vercel.com/support
- Project Issues: Create issue using bug report template

## Useful Commands

```bash
# Run all CI checks locally
npm run verify-ci

# Check workflow syntax
gh workflow view ci.yml

# List all secrets
gh secret list

# View deployment status
gh api repos/:owner/:repo/deployments

# Check rate limits
gh api rate_limit
```

## Prevention

### Before Pushing

```bash
# Always run verification
npm run verify-ci

# Check for uncommitted changes
git status

# Review changes
git diff
```

### Before Merging

- Ensure all checks pass
- Get required approvals
- Update branch with latest changes
- Review deployment plan

### Regular Maintenance

- Update dependencies weekly (Dependabot)
- Review failed workflow runs
- Monitor deployment success rate
- Update documentation as needed
