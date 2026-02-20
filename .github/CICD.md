# CI/CD Pipeline Documentation

## Overview
This project uses GitHub Actions for automated testing, linting, building, and deployment.

## Workflows

### 1. CI Workflow (`ci.yml`)
**Triggers:** Pull requests and pushes to `main` and `develop` branches

**Jobs:**
- **Lint & Format Check**: Runs ESLint and TypeScript type checking
- **Test**: Executes Jest tests with coverage reporting
- **Build**: Verifies the application builds successfully

### 2. Deploy to Staging (`deploy-staging.yml`)
**Triggers:** Pushes to `develop` branch or manual dispatch

**Environment:** staging
- Deploys to Vercel staging environment
- Uses testnet Stellar network

### 3. Deploy to Production (`deploy-production.yml`)
**Triggers:** Pushes to `main` branch or manual dispatch

**Environment:** production
- Runs full test suite before deployment
- Deploys to Vercel production environment
- Uses mainnet Stellar network
- Creates deployment tags for rollback capability

## Required Secrets

Configure these in GitHub repository settings (Settings → Secrets and variables → Actions):

### Vercel Deployment
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: API base URL (optional for CI)
- `STAGING_API_BASE_URL`: Staging API URL
- `PRODUCTION_API_BASE_URL`: Production API URL

### Optional
- `CODECOV_TOKEN`: For code coverage reporting

## Branch Protection Rules

Recommended settings for `main` and `develop` branches:

1. **Require pull request reviews before merging**
   - Required approvals: 1

2. **Require status checks to pass before merging**
   - Required checks:
     - `Lint & Format Check`
     - `Run Tests`
     - `Build Verification`

3. **Require branches to be up to date before merging**

4. **Do not allow bypassing the above settings**

## Pre-commit Hooks

Install Husky for local pre-commit checks:

```bash
npm install --save-dev husky
npx husky install
```

The pre-commit hook runs:
- ESLint
- TypeScript type checking
- Jest tests

## Rollback Strategy

### Automatic Rollback
If deployment fails, the workflow will stop and the previous version remains active.

### Manual Rollback

**Option 1: Revert via Git**
```bash
git revert <commit-hash>
git push origin main
```

**Option 2: Redeploy Previous Tag**
```bash
git checkout <previous-tag>
git push origin main --force
```

**Option 3: Vercel Dashboard**
Navigate to Vercel dashboard → Deployments → Select previous deployment → Promote to Production

## Monitoring Workflow Status

- View workflow runs: Repository → Actions tab
- Status badges are displayed in README.md
- Failed workflows send notifications to repository watchers

## Manual Deployment

Trigger manual deployments via GitHub Actions:
1. Go to Actions tab
2. Select deployment workflow
3. Click "Run workflow"
4. Choose branch and confirm

## Troubleshooting

**Build Failures:**
- Check environment variables are set correctly
- Verify Node.js version compatibility
- Review build logs in Actions tab

**Deployment Failures:**
- Verify Vercel tokens are valid
- Check Vercel project configuration
- Ensure deployment limits not exceeded

**Test Failures:**
- Review test logs in CI workflow
- Run tests locally: `npm run test`
- Check for environment-specific issues
