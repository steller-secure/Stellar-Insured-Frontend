Stellar Insured 🌐 — Frontend

[![CI](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/steller-secure/Stellar-Insured-Frontend/actions/workflows/deploy-production.yml)

Stellar Insured is a decentralized, transparent, and trustless insurance platform built on the Stellar ecosystem.
This frontend application provides users with a simple and intuitive interface to purchase insurance policies, submit claims, track coverage, and participate in decentralized governance—without relying on traditional insurance intermediaries.

The frontend is designed for policyholders, DAO participants, and contributors, enabling seamless interaction with Stellar Soroban smart contracts and backend services while preserving transparency, security, and usability.

✨ Key Features

Insurance policy purchase and management

Claim submission and claim status tracking

DAO proposal creation and voting

Wallet-based authentication (non-custodial)

Real-time UI updates from on-chain and backend events

Responsive and accessible design

🧑‍💻 Tech Stack

Framework: Next.js (App Router)

Language: TypeScript

Styling: CSS / Tailwind CSS

State Management: React Hooks

Blockchain: Stellar wallet integrations

Deployment: Vercel

📁 Project Structure
.
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable UI components
│   ├── data/                # Static and mock data
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── styles/              # Global and modular styles
│   ├── types/               # Shared TypeScript types
│   └── App.css              # Global app styles
├── middleware.ts            # Next.js middleware
├── .gitignore
├── CONTRIBUTING.md
├── README.md
├── components.json          # UI component config
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json

📦 Installation & Setup
Prerequisites

Node.js 18+

npm or yarn

Local Development
# Install dependencies
npm install

# Start development server
npm run dev


The application will be available at:
http://localhost:3000

🧪 Testing

This project has comprehensive test coverage with unit, integration, and E2E tests.

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

**Test Coverage**: Target 80% coverage for all critical paths
- Unit tests for all components
- Integration tests for user flows
- CI/CD pipeline enforces coverage thresholds

See [TEST_COVERAGE.md](./TEST_COVERAGE.md) for detailed testing documentation.
See [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md) for adding new tests.

🌐 Environment Variables

Create a .env.local file in the project root:

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_STELLAR_NETWORK=testnet

🧪 Testing
npm run test

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for automated testing, linting, and deployment.

### Workflows
- **CI**: Runs on all PRs - linting, testing, and build verification
- **Deploy to Staging**: Auto-deploys `develop` branch to staging environment
- **Deploy to Production**: Auto-deploys `main` branch to production environment

### Quick Setup
```bash
# Install dependencies including pre-commit hooks
npm install
npm run prepare

# Run CI checks locally
npm run lint
npm run test
npm run build
```

For detailed CI/CD documentation, see [.github/CICD.md](.github/CICD.md)

For quick reference, see [.github/QUICK_REFERENCE.md](.github/QUICK_REFERENCE.md)

🔗 Useful Links

Stellar Docs: https://developers.stellar.org

Soroban Docs: https://soroban.stellar.org/docs

Next.js Docs: https://nextjs.org/docs

🤝 Contributing

Contributions are welcome 🚀

Fork the repository

Create a feature branch

Commit clear, descriptive messages

Open a Pull Request

📜 License

MIT License
