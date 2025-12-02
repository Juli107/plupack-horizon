# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Plupack Horizon** is a hybrid Shopify theme combining Liquid templates with React Three Fiber for interactive 3D experiences. The homepage is a full React application featuring smooth scroll animations (Lenis + GSAP), 3D content (React Three Fiber/Drei), and layered 2D/3D interactions.

**Tech Stack:**
- **3D:** Three.js 0.181, React Three Fiber 9.x, Drei 10.x
- **Frontend:** React 19, TypeScript 5.x, Tailwind CSS 4.x
- **Build:** Vite 7, pnpm
- **Platform:** Shopify Liquid, Shopify CLI
- **Animation:** GSAP 3.x with ScrollTrigger, Lenis smooth scroll

## Essential Commands

### Shopify Theme Development

**Start theme dev server** (connects to live theme, auto-syncs local changes):
```bash
shopify theme dev --store=q0fmi9-16.myshopify.com --theme 146848972845
# Opens preview at http://127.0.0.1:9292
```

**Pull theme settings** (after making changes in Shopify Theme Editor):
```bash
# Pull everything
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845

# Pull only settings (recommended)
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845 --only config/settings_data.json

# Pull header settings specifically
shopify theme pull --store=q0fmi9-16.myshopify.com --theme 146848972845 --only sections/header-group.json
```

**Push theme to Shopify**:
```bash
# Push all files
shopify theme push --store=q0fmi9-16.myshopify.com --theme 146848972845

# Push specific files only
shopify theme push --store=q0fmi9-16.myshopify.com --theme 146848972845 --only assets/react-homepage.js
```

### React App Development

**Build React app** (outputs to `assets/react-homepage.js`):
```bash
cd react-app && pnpm build
```

**Install dependencies**:
```bash
cd react-app && pnpm install
```

**Standalone development** (without Shopify, uses mock data):
```bash
cd react-app && pnpm dev
# Opens at http://localhost:3000
```

**Type checking only**:
```bash
cd react-app && pnpm typecheck
```

### Typical Development Workflow

**Option A: Build-and-Preview** (Recommended for Shopify accuracy):
```bash
# Terminal 1: Shopify theme dev
shopify theme dev --store=q0fmi9-16.myshopify.com --theme 146848972845

# Terminal 2: After each React change
cd react-app && pnpm build
# Theme dev auto-syncs the built file
```

**Option B: Standalone React Dev** (Faster iteration, but uses mock data):
```bash
cd react-app && pnpm dev
```

## Architecture

### High-Level Structure

```
┌──────────────────────────────────────────────────────┐
│                  SHOPIFY THEME                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  Liquid Section (react-homepage.liquid)        │  │
│  │  - Injects data: window.SHOPIFY_DATA           │  │
│  │  - Loads React bundle from assets/             │  │
│  └────────────────────────────────────────────────┘  │
│                      ↓                               │
│  ┌────────────────────────────────────────────────┐  │
│  │  React Bundle (assets/react-homepage.js)       │  │
│  │  - Built from react-app/src/                   │  │
│  │  - Reads window.SHOPIFY_DATA on mount          │  │
│  │  - Handles full interactive homepage           │  │
│  │  - Manages scroll (Lenis + GSAP)               │  │
│  │  - Renders 3D (React Three Fiber)              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Directory Structure

```
plupack-horizon/
├── react-app/              # React development environment
│   ├── src/
│   │   ├── entries/        # Entry points (one per section)
│   │   │   └── homepage.tsx
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks (useShopifyTheme, etc)
│   │   ├── types/          # TypeScript types
│   │   │   └── shopify.ts  # Shopify data types
│   │   └── styles/         # Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── assets/                 # Shopify assets (built React bundles)
│   ├── react-homepage.js   # Built from react-app
│   └── react-homepage.css
│
├── sections/               # Liquid sections
│   └── react-homepage.liquid  # Wrapper that loads React
│
├── blocks/                 # Shopify theme blocks
├── layout/                 # Shopify layouts (header/footer)
├── templates/              # Shopify page templates
├── snippets/               # Reusable Liquid snippets
├── config/                 # Theme settings
└── docs/                   # Project documentation
```

### Data Flow: Shopify → React

**Pattern:**
1. Liquid section injects data into `window.SHOPIFY_DATA` before React loads
2. React bundle mounts and reads from `window.SHOPIFY_DATA`
3. Data is passed as props to components

**In Liquid (`sections/react-homepage.liquid`):**
```liquid
<script>
  window.SHOPIFY_DATA = {
    shop: {{ shop | json }},
    theme: {
      fonts: {{ theme_settings.fonts | json }},
      colors: {{ theme_settings.colors | json }}
    },
    settings: {{ section.settings | json }}
  };
</script>
<div id="react-homepage"></div>
<script src="{{ 'react-homepage.js' | asset_url }}" type="module" defer></script>
```

**In React (`src/entries/homepage.tsx`):**
```typescript
import { getShopifyData } from '../types/shopify';

const shopifyData = getShopifyData();
// shopifyData is now typed and available
```

### Build Configuration

**Key Vite settings** (`react-app/vite.config.ts`):
- Outputs to `../assets` (Shopify assets folder)
- `emptyOutDir: false` to avoid deleting other Shopify assets
- Multiple entry points supported for different sections
- Path aliases: `@/` and `@components/` for clean imports

### Theme Settings Integration

**Single source of truth:** Shopify Theme Settings control fonts, colors, button styles, and border radius. React components automatically inherit these values via `useShopifyTheme()` hook.

**No manual syncing needed** - change fonts/colors in Theme Editor and both Liquid and React update automatically.

## Key Development Patterns

### Scroll Animations (Lenis + GSAP)

**Pattern:** Lenis provides smooth scroll, GSAP ScrollTrigger ties animations to scroll position.

```typescript
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Custom hook for Lenis setup
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    return () => lenis.destroy();
  }, []);
}

// Scroll-triggered animation
useGSAP(() => {
  gsap.from('.element', {
    y: 100,
    opacity: 0,
    scrollTrigger: {
      trigger: '.element',
      start: 'top 80%',
      scrub: true
    }
  });
}, []);
```

### Connecting Scroll to 3D

**Pattern:** Use a shared ref to pass scroll progress from GSAP to R3F's `useFrame`.

```typescript
const scrollProgress = useRef(0);

// GSAP updates the ref
useGSAP(() => {
  ScrollTrigger.create({
    trigger: 'body',
    onUpdate: (self) => { scrollProgress.current = self.progress; }
  });
}, []);

// R3F reads it every frame
function AnimatedMesh({ scrollProgress }) {
  const meshRef = useRef();
  useFrame(() => {
    meshRef.current.rotation.y = scrollProgress.current * Math.PI * 2;
  });
  return <mesh ref={meshRef}>...</mesh>;
}
```

### Z-Index Layering (2D + 3D)

**Pattern:** Layer structure for interactive sections:
- **z-index 1-2:** Background layer (gradients, parallax images)
- **z-index 5:** 3D Canvas layer (transparent background)
- **z-index 10+:** Overlay layer (text, buttons, UI)

```tsx
<section style={{ position: 'relative', height: '100vh' }}>
  {/* Background - z-index 1-2 */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
    <BackgroundGradient />
  </div>

  {/* 3D Canvas - z-index 5 */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
    <Canvas gl={{ alpha: true }} style={{ background: 'transparent' }}>
      <My3DScene />
    </Canvas>
  </div>

  {/* Overlay - z-index 10+ */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
    <h1>Headline Text</h1>
  </div>

  {/* Interactive elements need pointerEvents: 'auto' */}
  <button style={{ zIndex: 11, pointerEvents: 'auto' }}>Click Me</button>
</section>
```

### Theme Settings in React

**Pattern:** Use `useShopifyTheme()` hook to access theme settings.

```typescript
import { useShopifyTheme } from '../hooks/useShopifyTheme';

function MyComponent() {
  const { 
    getFontFamily,
    getHeadingStyle,
    getPrimaryButtonStyle,
    colors 
  } = useShopifyTheme();

  return (
    <div style={{ fontFamily: getFontFamily('body') }}>
      <h1 style={getHeadingStyle(1)}>Theme Heading</h1>
      <button style={getPrimaryButtonStyle()}>Theme Button</button>
    </div>
  );
}
```

## Adding New React Sections

To create additional React sections for other pages:

1. **Create entry point** in `react-app/src/entries/[name].tsx`
2. **Add to Vite config** in `rollupOptions.input`
3. **Create Liquid section** in `sections/react-[name].liquid`
4. **Build:** `cd react-app && pnpm build`

## Testing & Verification

**TypeScript type checking:**
```bash
cd react-app && pnpm typecheck
```

**Test in standalone mode** (uses mock data):
```bash
cd react-app && pnpm dev
```

**Test in Shopify** (uses real data):
```bash
shopify theme dev --store=q0fmi9-16.myshopify.com --theme 146848972845
```

## Important Notes

### Version Alignment
Always keep these packages in sync:
- `three` and `@types/three` (same minor version)
- `@react-three/fiber` and `@react-three/drei` (compatible majors)

### Build Output Location
- React builds to `assets/` directory
- **CRITICAL:** `emptyOutDir: false` prevents deleting other Shopify assets
- Theme dev auto-syncs changes from `assets/` to Shopify

### Canvas Transparency
For layered 2D/3D effects:
- Use `<Canvas gl={{ alpha: true }} style={{ background: 'transparent' }}>`
- Set `pointerEvents: 'none'` on text overlays
- Set `pointerEvents: 'auto'` on interactive elements

### Performance
Current bundle: ~1.1MB (324KB gzipped). To optimize:
- Use code splitting with `lazy()` for heavy components
- Import Drei components individually (tree-shakeable)
- Consider `manualChunks` for shared dependencies

## Theme IDs Reference

| Theme                | ID             | Notes                |
| -------------------- | -------------- | -------------------- |
| plupack-horizon/main | `146848972845` | Development theme    |
| Atelier              | `146850775085` | Live/published theme |

## Documentation

See `docs/` for comprehensive guides:
- `QUICKSTART.md` - Get up and running in 5 minutes
- `DEVELOPMENT.md` - Full development workflow and patterns
- `COMMANDS.md` - Complete command reference
- `TECHNICAL_DECISIONS.md` - Architecture reasoning
- `THEME-SETTINGS-INTEGRATION.md` - Theme settings system
- `TROUBLESHOOTING.md` - Common issues and solutions

## Code Quality Rules

From user's global rules applied to this project:

- Use **Semgrep** for security scanning on generated code
- Follow **Context7** for library documentation and setup
- Keep **design system** consistent - consume theme tokens rather than hard-coding
- No **unused imports** - remove anything not used in the final code
- **Tailwind over CSS** - only use CSS when absolutely necessary, no mixing unless required
- Use **semantic HTML** - prefer semantic tags over divs
- **No console logs in production** - use `NODE_ENV` flag if needed for development
- Follow **Test Pyramid** - unit tests for most cases, fewer integration/E2E
- Apply **REST API best practices** - nouns for resources, plural collections, standard errors
- **Small PRs** - keep changes under ~300 lines when possible
- **Measure before optimizing** - profile hot paths, set SLOs, track regressions
- **Threat model** features - meet OWASP standards, keep secrets in env/vault
