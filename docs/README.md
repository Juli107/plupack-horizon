# PLUPack Horizon - React 3D for Shopify

A hybrid Shopify theme with React Three Fiber for 3D experiences.

## Documentation

| Document                                           | Description                     |
| -------------------------------------------------- | ------------------------------- |
| [Quick Start](docs/QUICKSTART.md)                  | Get up and running in 5 minutes |
| [Development Guide](docs/DEVELOPMENT.md)           | Full development workflow       |
| [Technical Decisions](docs/TECHNICAL_DECISIONS.md) | Architecture and reasoning      |
| [Troubleshooting](docs/TROUBLESHOOTING.md)         | Common issues and solutions     |

## Quick Commands

```bash
# Install React dependencies
cd react-app && pnpm install

# Start Shopify theme dev
shopify theme dev --store=YOUR-STORE.myshopify.com

# Build React to Shopify assets
cd react-app && pnpm build

# Local React development
cd react-app && pnpm dev
```

## Project Structure

```
├── react-app/          # React Three Fiber app (TypeScript)
│   ├── src/
│   │   ├── components/ # R3F components
│   │   ├── entries/    # Entry points per section
│   │   └── types/      # TypeScript types
│   └── vite.config.ts
│
├── assets/             # Shopify assets (built React bundles)
├── sections/           # Liquid sections (React wrappers)
├── templates/          # Shopify templates
└── docs/               # Documentation
```

## Tech Stack

- **3D:** Three.js, React Three Fiber, Drei
- **Frontend:** React 19, TypeScript
- **Build:** Vite 7, pnpm
- **Platform:** Shopify Liquid
