# CI/CD Quick Reference

## 🚀 Quick Setup

```bash
# Install dependencies including Husky
npm install

# Setup pre-commit hooks
npm run prepare

# Run setup script (requires GitHub CLI)
./.github/setup-cicd.sh
```

## 📋 Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | PR to main/develop, Push to main/develop | Lint, test, build verification |
| Deploy Staging | Push to develop | Auto-deploy to staging |
| Deploy Production | Push to main | Auto-deploy to production |

## ✅ Status Checks

All PRs must pass:
- ✅ Lint & Format Check
- ✅ Run Tests  
- ✅ Build Verification

## 🔐 Required Secrets

```bash
VERCEL_TOKEN              # Vercel auth token
VERCEL_ORG_ID            # Vercel organization ID
VERCEL_PROJECT_ID        # Vercel project ID
STAGING_API_BASE_URL     # Staging API URL
PRODUCTION_API_BASE_URL  # Production API URL
CODECOV_TOKEN            # (Optional) Code coverage
```

## 🌍 Environments

- **staging**: Auto-deploys from `develop` branch
- **production**: Auto-deploys from `main` branch (requires approval)

## 🔄 Deployment Flow

```
feature → develop → staging environment
              ↓
           main → production environment
```

## 🛡️ Branch Protection

**main branch:**
- Requires 1 approval
- All status checks must pass
- No direct pushes

**develop branch:**
- Requires 1 approval
- All status checks must pass

## 🔧 Local Development

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build application
npm run build
```

## 🚨 Rollback Production

**Option 1: Git revert**
```bash
git revert <commit-hash>
git push origin main
```

**Option 2: Redeploy tag**
```bash
git checkout <tag-name>
git push origin main --force
```

**Option 3: Vercel dashboard**
- Go to Vercel → Deployments
- Select previous deployment
- Click "Promote to Production"

## 📊 Monitoring

- **Workflow status**: GitHub Actions tab
- **Deployment status**: Vercel dashboard
- **Coverage reports**: Codecov (if configured)

## 🐛 Troubleshooting

**CI failing?**
```bash
# Run checks locally
npm run lint
npm run test
npm run build
```

**Deployment failing?**
- Check Vercel token validity
- Verify environment variables
- Review workflow logs

## 📚 Full Documentation

- [Complete CI/CD Guide](.github/CICD.md)
- [Branch Protection Setup](.github/BRANCH_PROTECTION.md)
