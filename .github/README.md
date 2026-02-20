# .github Directory

This directory contains all CI/CD configuration, automation, and documentation for the Stellar Insured Frontend project.

## 📁 Directory Structure

```
.github/
├── workflows/                      # GitHub Actions workflows
│   ├── ci.yml                     # Main CI pipeline
│   ├── deploy-staging.yml         # Staging deployment
│   ├── deploy-production.yml      # Production deployment
│   └── auto-label.yml             # Auto PR labeling
├── ISSUE_TEMPLATE/                # Issue templates
│   ├── bug_report.yml             # Bug report template
│   └── feature_request.yml        # Feature request template
├── BRANCH_PROTECTION.md           # Branch protection setup guide
├── CICD.md                        # Complete CI/CD documentation
├── CODEOWNERS                     # Code ownership rules
├── dependabot.yml                 # Dependency update automation
├── IMPLEMENTATION_SUMMARY.md      # Implementation details
├── labeler.yml                    # Auto-labeling configuration
├── pull_request_template.md       # PR template
├── QUICK_REFERENCE.md             # Quick reference guide
├── README.md                      # This file
├── setup-cicd.sh                  # Automated setup script
├── TROUBLESHOOTING.md             # Troubleshooting guide
└── verify-ci.sh                   # Local CI verification script
```

## 🚀 Quick Start

### First Time Setup

1. **Install dependencies**
   ```bash
   npm install
   npm run prepare
   ```

2. **Configure GitHub secrets**
   ```bash
   # Using automated script (requires GitHub CLI)
   ./.github/setup-cicd.sh
   
   # Or manually via GitHub Settings → Secrets
   ```

3. **Setup branch protection**
   ```bash
   # Follow the guide
   cat .github/BRANCH_PROTECTION.md
   ```

### Daily Development

```bash
# Before committing (optional - pre-commit hook runs automatically)
npm run verify-ci

# Commit and push
git add .
git commit -m "feat: your feature"
git push
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| [CICD.md](CICD.md) | Complete CI/CD pipeline documentation |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick reference for common tasks |
| [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md) | Branch protection setup instructions |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Implementation details and checklist |

## 🔄 Workflows

### CI Workflow (`ci.yml`)
- **Triggers**: PR and push to main/develop
- **Jobs**: Lint, Test, Build
- **Purpose**: Ensure code quality

### Deploy Staging (`deploy-staging.yml`)
- **Triggers**: Push to develop
- **Environment**: staging
- **Purpose**: Auto-deploy to staging

### Deploy Production (`deploy-production.yml`)
- **Triggers**: Push to main
- **Environment**: production
- **Purpose**: Auto-deploy to production

### Auto Label (`auto-label.yml`)
- **Triggers**: PR opened/edited
- **Purpose**: Automatically label PRs

## 🛠️ Scripts

### `setup-cicd.sh`
Automated setup script for configuring:
- GitHub secrets
- Environments
- Branch protection

**Usage**:
```bash
./.github/setup-cicd.sh
```

**Requirements**: GitHub CLI (`gh`)

### `verify-ci.sh`
Local verification script that runs all CI checks:
- ESLint
- TypeScript type checking
- Jest tests
- Build verification

**Usage**:
```bash
npm run verify-ci
# or
./.github/verify-ci.sh
```

## 🔐 Required Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

### Repository Secrets
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `CODECOV_TOKEN` - (Optional) Codecov token

### Environment Secrets

**Staging**:
- `STAGING_API_BASE_URL`

**Production**:
- `PRODUCTION_API_BASE_URL`

## 🌍 Environments

### Staging
- **Branch**: develop
- **URL**: https://staging.stellarinsured.com
- **Network**: Stellar testnet
- **Auto-deploy**: Yes

### Production
- **Branch**: main
- **URL**: https://stellarinsured.com
- **Network**: Stellar mainnet
- **Auto-deploy**: Yes (with approval)

## 🛡️ Branch Protection

### Main Branch
- ✅ Requires 1 approval
- ✅ All status checks must pass
- ✅ Dismiss stale reviews
- ✅ No direct pushes
- ✅ No force pushes

### Develop Branch
- ✅ Requires 1 approval
- ✅ All status checks must pass
- ✅ No force pushes

## 🏷️ Auto-labeling

PRs are automatically labeled based on changed files:
- `ci-cd` - Workflow changes
- `documentation` - Documentation updates
- `dependencies` - Dependency updates
- `frontend` - Source code changes
- `configuration` - Config file changes
- `testing` - Test file changes

## 🤖 Dependabot

Automated dependency updates:
- **npm packages**: Weekly (Mondays, 9:00 AM)
- **GitHub Actions**: Weekly (Mondays, 9:00 AM)
- **Max PRs**: 5 for npm, 3 for actions

## 📋 Templates

### Pull Request Template
Standardized PR template with:
- Description
- Type of change
- Testing checklist
- Deployment notes

### Issue Templates
- **Bug Report**: Structured bug reporting
- **Feature Request**: Feature suggestions

## 🔍 Code Ownership

Defined in `CODEOWNERS`:
- Default: `@steller-secure/frontend-team`
- Workflows: `@steller-secure/devops-team`
- Infrastructure: `@steller-secure/devops-team`

## 🚨 Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Quick checks:
```bash
# Verify workflow syntax
gh workflow view ci.yml

# Check recent runs
gh run list --limit 5

# View specific run
gh run view <run-id> --log
```

## 📊 Monitoring

- **Workflow Status**: Repository → Actions tab
- **Deployment Status**: Vercel dashboard
- **Coverage**: Codecov (if configured)
- **Dependencies**: Dependabot PRs

## 🔄 Rollback Procedures

See [CICD.md](CICD.md#rollback-strategy) for detailed rollback procedures.

Quick rollback:
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or redeploy previous tag
git checkout <previous-tag>
git push origin main --force
```

## 📞 Support

- **Documentation Issues**: Create issue using bug report template
- **GitHub Actions**: https://github.com/contact
- **Vercel**: https://vercel.com/support

## 🎯 Best Practices

1. Always run `npm run verify-ci` before pushing
2. Keep PRs small and focused
3. Write descriptive commit messages
4. Update documentation with code changes
5. Review CI logs for failures
6. Test locally before pushing
7. Keep dependencies up to date

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
