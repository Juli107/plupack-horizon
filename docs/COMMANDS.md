# Essential Commands

Quick reference for the most important commands in this project.

## Theme Development

### Start Dev Server (connects to specific theme)

```bash
shopify theme dev --store=q0fmi9-16.myshopify.com --theme 146848972845
```

This syncs your local files to **plupack-horizon/main** and opens a preview at http://127.0.0.1:9292

### Pull Theme Settings from Shopify

```bash
# Pull everything
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845

# Pull only settings (after making changes in Theme Editor)
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845 --only config/settings_data.json

# Pull header settings specifically
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845 --only sections/header-group.json
```

### Push Theme to Shopify

```bash
# Push all files
shopify theme push --store=q0fmi9-16.myshopify.com --theme 146848972845

# Push specific files only
shopify theme push --store=q0fmi9-16.myshopify.com --theme 146848972845 --only assets/react-homepage.js
```

### List All Themes

```bash
shopify theme list --store=q0fmi9-16.myshopify.com
```

---

## React App (3D Homepage)

### Build React App

```bash
cd react-app
pnpm build
```

Outputs to `assets/react-homepage.js` — theme dev auto-syncs it.

### Install Dependencies

```bash
cd react-app
pnpm install
```

### Development (standalone, without Shopify)

```bash
cd react-app
pnpm dev
```

Opens at http://localhost:5173 (uses mock data, not real Shopify data)

---

## Git

### Check Status

```bash
git status
```

### Commit Changes

```bash
git add .
git commit -m "your message"
```

### Push to GitHub

```bash
git push origin home   # or whatever branch you're on
```

### Switch Branches

```bash
git checkout main
git checkout home
```

---

## Quick Workflows

### After editing React components:

```bash
cd react-app && pnpm build
# Theme dev auto-syncs the built file
```

### After making changes in Theme Editor:

```bash
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845 --only config/settings_data.json --only sections/header-group.json
```

### Starting fresh dev session:

```bash
# Terminal 1: Theme dev
shopify theme dev --store=q0fmi9-16.myshopify.com --theme 146848972845

# Terminal 2: React watch (optional, for faster iteration)
cd react-app && pnpm dev
```

---

## Theme IDs Reference

| Theme                | ID             | Notes                |
| -------------------- | -------------- | -------------------- |
| plupack-horizon/main | `146848972845` | Your working theme   |
| Atelier              | `146850775085` | Live/published theme |

---

## Troubleshooting

### Changes in Theme Editor not showing locally?

Pull from the correct theme:

```bash
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845
```

### React changes not showing?

Rebuild:

```bash
cd react-app && pnpm build
```

### TypeScript errors?

```bash
cd react-app && pnpm tsc --noEmit
```
