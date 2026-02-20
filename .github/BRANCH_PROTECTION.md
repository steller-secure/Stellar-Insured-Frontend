# Branch Protection Configuration

## Setup Instructions

Navigate to: **Repository Settings → Branches → Add branch protection rule**

---

## Protection Rule for `main` Branch

### Branch name pattern
```
main
```

### Settings

#### Protect matching branches
- ✅ **Require a pull request before merging**
  - Required approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if CODEOWNERS file exists)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `Lint & Format Check`
    - `Run Tests`
    - `Build Verification`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (optional but recommended)

- ✅ **Require linear history**

- ✅ **Do not allow bypassing the above settings**
  - Include administrators: `Yes`

#### Rules applied to everyone including administrators
- ✅ **Restrict deletions**
- ✅ **Require deployments to succeed before merging** (if using GitHub Environments)

---

## Protection Rule for `develop` Branch

### Branch name pattern
```
develop
```

### Settings

#### Protect matching branches
- ✅ **Require a pull request before merging**
  - Required approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `Lint & Format Check`
    - `Run Tests`
    - `Build Verification`

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

#### Rules applied to everyone including administrators
- ✅ **Restrict deletions**

---

## GitHub Environments Setup

Navigate to: **Repository Settings → Environments**

### Staging Environment
- **Name:** `staging`
- **Deployment branches:** `develop` only
- **Environment secrets:**
  - `STAGING_API_BASE_URL`
- **Reviewers:** (optional) Add required reviewers

### Production Environment
- **Name:** `production`
- **Deployment branches:** `main` only
- **Environment secrets:**
  - `PRODUCTION_API_BASE_URL`
- **Reviewers:** Add at least 1 required reviewer for production deployments
- **Wait timer:** 5 minutes (optional safety delay)

---

## Repository Secrets Setup

Navigate to: **Repository Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

### Vercel Integration
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
```

### Optional Secrets
```
CODECOV_TOKEN=<your-codecov-token>
NEXT_PUBLIC_API_BASE_URL=<default-api-url>
```

---

## Verification

After setup, verify:
1. Create a test branch and PR
2. Confirm status checks appear and must pass
3. Confirm merge is blocked until checks pass
4. Confirm approval is required before merge
