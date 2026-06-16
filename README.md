# 🌐 Stellar Insured Frontend

[![CI](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/deploy-production.yml)

A modern, decentralized insurance platform built on the Stellar ecosystem.

Stellar Insured empowers individuals and organizations to purchase insurance coverage, submit claims, participate in governance, and manage policies through a transparent, blockchain-powered experience. By leveraging Stellar and Soroban smart contracts, the platform removes traditional intermediaries while improving transparency, security, and accessibility.

---

## 🚀 Overview

Traditional insurance systems often suffer from:

* Limited transparency
* Slow claims processing
* High operational overhead
* Centralized decision-making
* Restricted access to governance

Stellar Insured addresses these challenges through a decentralized architecture where policyholders can interact directly with smart contracts and governance mechanisms.

The frontend serves as the primary user interface for:

* Policyholders managing insurance coverage
* Claimants submitting and tracking claims
* DAO members participating in governance
* Contributors interacting with protocol services

---

## ✨ Core Features

### 🛡️ Insurance Management

* Browse available insurance products
* Purchase policies directly through connected wallets
* View active and expired coverage
* Track policy details and premium information

### 📋 Claims Processing

* Submit insurance claims digitally
* Upload supporting evidence and documentation
* Monitor claim review progress
* Receive claim status updates in real time

### 🏛️ DAO Governance

* Create governance proposals
* Vote on protocol decisions
* Monitor proposal activity
* Participate in community-driven insurance management

### 🔐 Wallet Authentication

* Non-custodial authentication
* Stellar wallet integration
* Secure transaction signing
* No usernames or passwords required

### 📊 Real-Time Updates

* Live policy updates
* Instant claim status synchronization
* Governance voting updates
* Blockchain event monitoring

### ♿ Accessibility & UX

* WCAG-focused accessibility improvements
* Keyboard navigation support
* Responsive mobile-first design
* Screen reader compatibility
* Dark and light theme support

---

## 🏗️ Architecture

```text
┌──────────────────────────┐
│     Frontend (Next.js)   │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│     Backend Services     │
│     REST APIs            │
│     Authentication       │
│     Claims Processing    │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│   Soroban Smart Contracts │
│   Policy Management       │
│   Governance              │
│   Claims Settlement       │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│    Stellar Blockchain    │
└──────────────────────────┘
```

---

## 🧑‍💻 Technology Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* ShadCN UI

### State & Data

* React Hooks
* Context API
* Custom Data Fetching Hooks

### Blockchain

* Stellar Wallet Kit
* Soroban Smart Contracts
* Stellar Network APIs

### Tooling

* ESLint
* Prettier
* GitHub Actions
* Vercel Deployment

---

## 📁 Project Structure

```bash
.
├── public/
│   ├── images/
│   ├── icons/
│   └── assets/
│
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable UI components
│   ├── data/                 # Static data & mock data
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities & helpers
│   ├── styles/               # Global styles
│   ├── types/                # Shared TypeScript types
│   └── context/              # Context providers
│
├── middleware.ts
├── README.md
├── CONTRIBUTING.md
├── components.json
├── next.config.ts
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

Before running the project locally, ensure you have:

* Node.js 18+
* npm, pnpm, or yarn
* Git
* A Stellar wallet (recommended: Freighter)

### Installation

Clone the repository:

```bash
git clone https://github.com/steller-secure/Stellar-Insured-Frontend.git

cd Stellar-Insured-Frontend
```

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

NEXT_PUBLIC_STELLAR_NETWORK=testnet

NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org

NEXT_PUBLIC_APP_NAME=Stellar Insured
```

### Variable Reference

| Variable                    | Description                       |
| --------------------------- | --------------------------------- |
| NEXT_PUBLIC_API_BASE_URL    | Backend API URL                   |
| NEXT_PUBLIC_STELLAR_NETWORK | Stellar network (testnet/mainnet) |
| NEXT_PUBLIC_STELLAR_RPC_URL | Soroban RPC endpoint              |
| NEXT_PUBLIC_APP_NAME        | Application display name          |

---

## 🧪 Testing

This project maintains comprehensive automated testing coverage.

### Run All Tests

```bash
npm test
```

### Coverage Report

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

### Build Verification

```bash
npm run build
```

> **Build system:** This project uses **Turbopack**, the default bundler in
> Next.js 16, for both `next dev` and `next build`. No custom webpack
> configuration is required — production chunk splitting is handled
> automatically by Turbopack. Turbopack is opted into explicitly via the
> `turbopack: {}` block in [`next.config.ts`](./next.config.ts). If you ever
> need to fall back to webpack, add the `--webpack` flag to the `dev`/`build`
> scripts in `package.json`.

### Linting

```bash
npm run lint
```

### Coverage Goals

* Unit Tests
* Integration Tests
* User Flow Validation
* Accessibility Testing
* Component Testing

Target Coverage: **80%+**

---

## 🚀 CI/CD Pipeline

GitHub Actions automatically handles:

### Continuous Integration

* Dependency installation
* Type checking
* Linting
* Unit testing
* Build verification

### Continuous Deployment

#### Staging

Triggered on:

```text
develop branch
```

#### Production

Triggered on:

```text
main branch
```

Deployment Platform:

```text
Vercel
```

---

## 🔒 Security

Security is a core priority of Stellar Insured.

### Security Measures

* Wallet-based authentication
* Non-custodial user accounts
* Environment variable protection
* Secure API communication
* Smart contract verification
* Input validation and sanitization

### Best Practices

* Never commit `.env` files
* Validate all user inputs
* Review smart contract interactions carefully
* Keep dependencies updated

---

## ♿ Accessibility

The application follows modern accessibility standards.

Implemented improvements include:

* ARIA labels
* Keyboard navigation
* Screen reader support
* Focus management
* Semantic HTML
* Responsive design

Target Standard:

```text
WCAG 2.1 AA
```

---

## 🤝 Contributing

We welcome community contributions.

### Development Workflow

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Make changes
4. Run tests

```bash
npm run lint
npm run test
npm run build
```

5. Commit using conventional commits

```bash
feat: add claim status notifications
```

6. Push changes
7. Open a Pull Request

For detailed contribution guidelines see:

```text
CONTRIBUTING.md
```

---

## 📚 Resources

### Stellar Ecosystem

* Stellar Developer Docs
* Soroban Documentation
* Stellar Wallet Kit

### Frontend Development

* Next.js Documentation
* React Documentation
* Tailwind CSS Documentation

---

## 🗺️ Roadmap

### Phase 1

* Policy marketplace
* Wallet authentication
* Claims submission

### Phase 2

* DAO governance
* Voting mechanisms
* Proposal management

### Phase 3

* Advanced analytics
* Risk scoring
* On-chain claim automation

### Phase 4

* Mobile application
* Multi-chain integrations
* Institutional insurance pools

---

## 📜 License

Licensed under the MIT License.

See the LICENSE file for details.

---

Built with ❤️ on Stellar to make insurance more transparent, accessible, and community-driven.
