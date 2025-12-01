# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Shopify CLI (`npm install -g @shopify/cli`)
- A Shopify store (development or production)

## Setup

### 1. Install React Dependencies

```bash
cd react-app
pnpm install
```

### 2. Connect to Shopify

```bash
# In project root
shopify auth login
```

### 3. Start Development

**Terminal 1 - Shopify theme server:**

```bash
shopify theme dev --store=YOUR-STORE.myshopify.com
```

**Terminal 2 - React development:**

```bash
cd react-app
pnpm dev      # For standalone dev
# OR
pnpm build    # To update Shopify
```

## Making Changes

### Edit React Components

1. Open `react-app/src/components/Homepage.tsx`
2. Make your changes
3. Run `pnpm build` in react-app/
4. Refresh Shopify preview

### Edit Shopify Settings

1. Open `sections/react-homepage.liquid`
2. Modify the `{% schema %}` block
3. Save - Shopify CLI auto-syncs
4. Open theme editor to see new settings

### Add Shopify Data to React

1. Add data in Liquid:

   ```liquid
   window.SHOPIFY_DATA = {
     myNewData: {{ some_liquid_var | json }}
   };
   ```

2. Add type in `src/types/shopify.ts`:

   ```typescript
   export interface ShopifyData {
     myNewData?: string;
   }
   ```

3. Use in React:
   ```typescript
   const { myNewData } = getShopifyData();
   ```

## Common Tasks

### Build for Production

```bash
cd react-app
pnpm build
```

### Type Check

```bash
cd react-app
pnpm typecheck
```

### Preview Locally (Without Shopify)

```bash
cd react-app
pnpm dev
# Opens localhost:3000
```

## File Locations

| What             | Where                            |
| ---------------- | -------------------------------- |
| React components | `react-app/src/components/`      |
| Entry points     | `react-app/src/entries/`         |
| Shopify types    | `react-app/src/types/shopify.ts` |
| Built bundles    | `assets/react-*.js`              |
| Liquid sections  | `sections/react-*.liquid`        |

## Need Help?

- See `docs/DEVELOPMENT.md` for detailed workflow
- See `docs/TECHNICAL_DECISIONS.md` for architecture reasoning
- Check `docs/TROUBLESHOOTING.md` for common issues
