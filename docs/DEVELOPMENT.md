# Plupack React Interactive Homepage Development Guide

This guide explains how to develop the interactive homepage experience for Shopify using React Three Fiber (R3F), Drei, GSAP, and Lenis.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Workflow](#development-workflow)
3. [Passing Data from Shopify to React](#passing-data-from-shopify-to-react)
4. [Scroll Animations (Lenis + GSAP)](#scroll-animations-lenis--gsap)
5. [Z-Index Layering (2D + 3D)](#z-index-layering-2d--3d)
6. [Shared Components Strategy](#shared-components-strategy)
7. [Adding New 3D Sections](#adding-new-3d-sections)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Why This Approach?

Shopify themes use Liquid templating which runs server-side on Shopify's servers. This means we can't directly use React/R3F in Liquid files. Our solution:

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY THEME                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Liquid Section (react-homepage.liquid)             │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  <script>                                    │    │   │
│  │  │    window.SHOPIFY_DATA = {                   │    │   │
│  │  │      shop: {{ shop | json }},                │    │   │
│  │  │      settings: { ... }                       │    │   │
│  │  │    }                                         │    │   │
│  │  │  </script>                                   │    │   │
│  │  │  <div id="react-homepage"></div>             │    │   │
│  │  │  <script src="react-homepage.js"></script>   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Bundle (assets/react-homepage.js)            │   │
│  │  - Reads window.SHOPIFY_DATA                        │   │
│  │  - Mounts to #react-homepage                        │   │
│  │  - Renders full interactive homepage                │   │
│  │  - Handles all scroll animations (Lenis + GSAP)     │   │
│  │  - Renders 3D content (R3F/Drei)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
plupack-horizon/
├── react-app/                     # React development environment
│   ├── src/
│   │   ├── entries/               # Entry points (one per Shopify section)
│   │   │   └── homepage.tsx       # Main homepage entry
│   │   ├── components/            # React components
│   │   │   └── Homepage.tsx       # Full interactive homepage
│   │   └── types/
│   │       └── shopify.ts         # TypeScript types for Shopify data
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── assets/                        # Shopify assets (built React bundles go here)
│   └── react-homepage.js          # Built from react-app
│
├── sections/                      # Shopify Liquid sections
│   └── react-homepage.liquid      # Wrapper that loads React
│
└── templates/                     # Shopify page templates
    └── index.json                 # Homepage using react-homepage section
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Install dependencies
cd react-app
pnpm install

# 2. Start Shopify theme dev (in project root)
cd ..
shopify theme dev --store=YOUR-STORE.myshopify.com
```

### Daily Development

#### Option A: Build-and-Preview (Recommended for Shopify accuracy)

```bash
# Terminal 1 - Shopify theme server
shopify theme dev --store=YOUR-STORE.myshopify.com

# Terminal 2 - Build React on changes
cd react-app
pnpm build   # Run this after each React change
```

#### Option B: Standalone React Dev (Faster iteration)

```bash
# For rapid React development without Shopify
cd react-app
pnpm dev     # Opens localhost:3000 with hot reload
```

The standalone dev server simulates Shopify data via `index.html`:

```html
<script>
  window.SHOPIFY_DATA = {
    shop: { name: 'Test Store' },
    settings: { backgroundColor: '#146C90' },
  };
</script>
```

### Build for Production

```bash
cd react-app
pnpm build
```

This outputs to `../assets/react-3d-hero.js`, which Shopify automatically syncs.

---

## Passing Data from Shopify to React

### The Pattern

1. **Liquid injects data** into `window.SHOPIFY_DATA` before React loads
2. **React reads** from `window.SHOPIFY_DATA` on mount
3. **Data is passed as props** to components

### In Liquid (`sections/react-homepage.liquid`):

```liquid
<script>
  window.SHOPIFY_DATA = {
    // Shop info (always available)
    shop: {
      name: {{ shop.name | json }},
      currency: {{ shop.currency | json }},
      domain: {{ shop.domain | json }}
    },

    // Section settings (from {% schema %})
    settings: {
      backgroundColor: {{ section.settings.background_color | json }},
      accentColor: {{ section.settings.accent_color | json }}
    },

    // Product data (only on product pages)
    {% if product %}
    product: {
      title: {{ product.title | json }},
      price: {{ product.price | money_without_currency | json }},
      images: {{ product.images | map: 'src' | json }}
    },
    {% endif %}

    // Cart data (always available)
    cart: {
      itemCount: {{ cart.item_count | json }},
      totalPrice: {{ cart.total_price | money_without_currency | json }}
    }
  };
</script>
```

### In React (`src/entries/homepage.tsx`):

```typescript
import { getShopifyData } from '../types/shopify';

const shopifyData = getShopifyData();

function App() {
  return (
    <Homepage
      backgroundColor={
        shopifyData.settings?.backgroundColor ?? '#146C90'
      }
      shopName={shopifyData.shop?.name ?? 'Store'}
    />
  );
}
```

### Type Safety

All Shopify data is typed in `src/types/shopify.ts`:

```typescript
export interface ShopifyData {
  shop?: ShopifyShop;
  settings?: ShopifySettings;
  product?: ShopifyProduct;
  // ... etc
}

// Helper with fallback
export function getShopifyData(): ShopifyData {
  return window.SHOPIFY_DATA ?? {};
}
```

---

## Scroll Animations (Lenis + GSAP)

### Overview

The project uses:

- **Lenis** - Smooth scroll library (buttery smooth momentum scrolling)
- **GSAP + ScrollTrigger** - Animation engine with scroll-based triggers
- **@gsap/react** - React hooks for GSAP (`useGSAP`)

### Installed Packages

```json
{
  "dependencies": {
    "lenis": "^1.3.15",
    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.2"
  }
}
```

### Basic Setup Pattern

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Custom hook for Lenis smooth scroll
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    return () => {
      lenis.destroy();
    };
  }, []);
}

// Example component
function MyComponent() {
  useLenis();
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll-triggered animation
    gsap.from(elementRef.current, {
      y: 100,
      opacity: 0,
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        end: 'top 50%',
        scrub: true, // Ties animation to scroll position
      },
    });
  }, []);

  return <div ref={elementRef}>Animated content</div>;
}
```

### Connecting Scroll to 3D (R3F)

The key pattern is using a **shared ref** to pass scroll progress from GSAP to R3F's `useFrame`:

```tsx
function Hero3D() {
  const scrollProgress = useRef(0);

  // GSAP updates the ref
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgress.current = self.progress; // 0 to 1
      },
    });
  }, []);

  return (
    <Canvas>
      <AnimatedMesh scrollProgress={scrollProgress} />
    </Canvas>
  );
}

// Inside the 3D scene
function AnimatedMesh({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    const progress = scrollProgress.current;

    // Animate based on scroll
    meshRef.current.rotation.y = progress * Math.PI * 2;
    meshRef.current.position.y = progress * -5;
    meshRef.current.scale.setScalar(1 + progress * 0.5);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}
```

### Common ScrollTrigger Patterns

```tsx
useGSAP(() => {
  // 1. Entrance animation (plays once)
  gsap.from('.element', {
    y: 100,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.element',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // 2. Scrubbed animation (tied to scroll position)
  gsap.to('.parallax', {
    y: -200,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1, // Smooth scrubbing with 1s delay
    },
  });

  // 3. Pin element during scroll
  gsap.to('.pinned', {
    scrollTrigger: {
      trigger: '.pinned',
      pin: true,
      start: 'top top',
      end: '+=1000', // Pin for 1000px of scrolling
    },
  });

  // 4. Timeline with scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.section',
      start: 'top center',
      end: 'bottom center',
      scrub: true,
    },
  });

  tl.from('.item-1', { x: -100, opacity: 0 })
    .from('.item-2', { x: 100, opacity: 0 })
    .from('.item-3', { y: 50, opacity: 0 });
}, []);
```

---

## Z-Index Layering (2D + 3D)

### Layer Architecture

All interactive/animated content should live in React. Here's the z-index strategy:

```
┌────────────────────────────────────────────────────────────┐
│                    BROWSER VIEWPORT                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  z-index: 1-2    │  BACKGROUND LAYER (2D)            │  │
│  │  ────────────────│  - Gradient backgrounds           │  │
│  │                  │  - Decorative shapes              │  │
│  │                  │  - Parallax images                │  │
│  ├──────────────────┼───────────────────────────────────┤  │
│  │  z-index: 5      │  3D CANVAS LAYER                  │  │
│  │  ────────────────│  - R3F Canvas (transparent bg)    │  │
│  │                  │  - 3D objects, particles          │  │
│  ├──────────────────┼───────────────────────────────────┤  │
│  │  z-index: 10+    │  OVERLAY LAYER (2D)               │  │
│  │  ────────────────│  - Text, headings                 │  │
│  │                  │  - Buttons, CTAs                  │  │
│  │                  │  - UI elements                    │  │
│  └──────────────────┴───────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Implementation

```tsx
export function Hero3D() {
  return (
    <section style={{ position: 'relative', height: '100vh' }}>
      {/* BACKGROUND LAYER - z-index 1-2 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <BackgroundGradient />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <DecorativeShapes />
      </div>

      {/* 3D CANVAS LAYER - z-index 5 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        <Canvas
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <My3DScene />
        </Canvas>
      </div>

      {/* OVERLAY LAYER - z-index 10+ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <h1>Headline Text</h1>
        <p>Subheadline</p>
      </div>

      {/* Interactive overlay elements need pointerEvents: 'auto' */}
      <button
        style={{
          position: 'absolute',
          zIndex: 11,
          pointerEvents: 'auto',
        }}
      >
        Click Me
      </button>
    </section>
  );
}
```

### Key Points

1. **Canvas must be transparent**: Use `gl={{ alpha: true }}` and `style={{ background: 'transparent' }}`
2. **Use `pointerEvents: 'none'`** on text overlays so clicks pass through to 3D
3. **Use `pointerEvents: 'auto'`** on clickable elements to re-enable interaction
4. **Position everything `absolute`** within a `relative` container

### Animating Layers Independently

Each layer can have its own scroll animations:

```tsx
function Hero3D() {
  const bgRef = useRef(null);
  const overlayRef = useRef(null);

  useGSAP(() => {
    // Background moves slower (parallax)
    gsap.to(bgRef.current, {
      y: 200,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '+=1000',
        scrub: 0.5,
      },
    });

    // Overlay text fades out faster
    gsap.to(overlayRef.current, {
      y: -100,
      opacity: 0,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '+=300',
        scrub: 1,
      },
    });
  }, []);

  return (
    <section>
      <div ref={bgRef} style={{ zIndex: 1 }}>
        Background
      </div>
      <Canvas style={{ zIndex: 5 }}>...</Canvas>
      <div ref={overlayRef} style={{ zIndex: 10 }}>
        Text
      </div>
    </section>
  );
}
```

---

## Shared Components Strategy

### Recommendation: Hybrid Approach

Keep header/footer in **Liquid** while using **React** for the full interactive homepage:

```
┌─────────────────────────────────────┐
│  HEADER (Liquid)                    │  ← Native Shopify cart, menus, account
├─────────────────────────────────────┤
│                                     │
│  INTERACTIVE HOMEPAGE (React)       │  ← Full page experience:
│  - Hero with 3D                     │     - Lenis smooth scroll
│  - Scroll-triggered sections        │     - GSAP animations
│  - Product showcases                │     - R3F 3D content
│  - Interactive elements             │     - Layered 2D/3D
│                                     │
├─────────────────────────────────────┤
│  FOOTER (Liquid)                    │  ← Native Shopify
└─────────────────────────────────────┘
```

### Why Not Full React SPA?

| Aspect             | Hybrid (Recommended) | Full React SPA       |
| ------------------ | -------------------- | -------------------- |
| Cart functionality | Native Shopify       | Must rebuild         |
| Account pages      | Native Shopify       | Must rebuild         |
| SEO                | Excellent (SSR)      | Requires workarounds |
| Bundle size        | Smaller              | Larger               |
| Shopify features   | Full access          | Limited              |
| Development effort | Lower                | Much higher          |

### When to Use React

✅ **Use React for:**

- The entire homepage experience
- All scroll-based animations
- 3D scenes and elements
- Interactive product showcases
- Custom configurators
- Complex animations
- Data visualizations

❌ **Keep in Liquid:**

- Navigation/header
- Footer
- Other standard pages (collections, product pages unless interactive)
- Cart drawer
- Account pages
- Checkout (Shopify-managed)

---

## Adding New React Sections

If you need a separate React section for another page (e.g., product viewer):

### Step 1: Create Entry Point

```typescript
// src/entries/product-viewer.tsx
import { createRoot } from 'react-dom/client';
import { ProductViewer } from '@components/ProductViewer';
import { getShopifyData } from '../types/shopify';

const data = getShopifyData();

const container = document.getElementById('react-product-viewer');
if (container) {
  createRoot(container).render(
    <ProductViewer product={data.product} />
  );
}
```

### Step 2: Add to Vite Config

```typescript
// vite.config.ts
rollupOptions: {
  input: {
    'react-homepage': resolve(__dirname, 'src/entries/homepage.tsx'),
    'react-product-viewer': resolve(__dirname, 'src/entries/product-viewer.tsx'),
  },
}
```

### Step 3: Create Liquid Section

```liquid
<!-- sections/react-product-viewer.liquid -->
<script>
  window.SHOPIFY_DATA = {
    product: {
      title: {{ product.title | json }},
      // ... product data
    }
  };
</script>

<div id="react-product-viewer"></div>
<script src="{{ 'react-product-viewer.js' | asset_url }}" type="module" defer></script>

{% schema %}
{
  "name": "3D Product Viewer",
  "settings": []
}
{% endschema %}
```

### Step 4: Build

```bash
cd react-app
pnpm build
```

---

## Performance Considerations

### Bundle Size

The current bundle is ~1.1MB (324KB gzipped). To reduce:

#### 1. Code Splitting

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      'three': ['three'],
      'r3f': ['@react-three/fiber', '@react-three/drei'],
    }
  }
}
```

#### 2. Lazy Load Drei Components

```typescript
import { Suspense, lazy } from 'react';

const OrbitControls = lazy(() =>
  import('@react-three/drei').then((m) => ({
    default: m.OrbitControls,
  }))
);
```

#### 3. Tree Shaking

Import only what you need from Drei:

```typescript
// ❌ Bad - imports everything
import * as Drei from '@react-three/drei';

// ✅ Good - tree shakeable
import { OrbitControls, Float } from '@react-three/drei';
```

### Loading Strategy

```liquid
<!-- Defer loading for non-critical 3D -->
<script src="{{ 'react-3d-hero.js' | asset_url }}" type="module" defer></script>

<!-- Or load after interaction -->
<script>
  document.getElementById('load-3d').addEventListener('click', () => {
    const script = document.createElement('script')
    script.src = "{{ 'react-3d-hero.js' | asset_url }}"
    script.type = 'module'
    document.body.appendChild(script)
  })
</script>
```

---

## Troubleshooting

### Three.js Not Rendering

**Problem:** Canvas appears but nothing renders.

**Solutions:**

1. Check browser console for WebGL errors
2. Ensure camera position is not at origin: `position={[0, 0, 5]}`
3. Add lights to the scene
4. Check if geometry/material are valid

### Module Import Errors in Shopify

**Problem:** `import` statements fail in Shopify.

**Solution:** Always build to a single bundle. The Vite config handles this - never use ES modules directly in Liquid.

### Shopify Data is Undefined

**Problem:** `window.SHOPIFY_DATA` is undefined.

**Solutions:**

1. Ensure the `<script>` with data comes BEFORE the React bundle
2. Check Liquid syntax - use `| json` filter for all values
3. Verify the section is actually rendering (check page source)

### Changes Not Appearing

**Problem:** React changes don't show in Shopify preview.

**Solutions:**

1. Run `pnpm build` in react-app
2. Wait for Shopify CLI to sync: look for "Synced » update assets/react-homepage.js"
3. Hard refresh browser: `Cmd+Shift+R`

### TypeScript Errors

**Problem:** Type errors with Drei/R3F.

**Solution:** Ensure `@types/three` version matches `three` version:

```json
{
  "dependencies": {
    "three": "^0.181.2"
  },
  "devDependencies": {
    "@types/three": "^0.181.0"
  }
}
```

---

## Quick Reference

### Commands

| Command             | Location   | Description      |
| ------------------- | ---------- | ---------------- |
| `pnpm dev`          | react-app/ | Local dev server |
| `pnpm build`        | react-app/ | Build to assets/ |
| `pnpm typecheck`    | react-app/ | Type check only  |
| `shopify theme dev` | root/      | Shopify preview  |

### Key Files

| File                                    | Purpose                 |
| --------------------------------------- | ----------------------- |
| `react-app/vite.config.ts`              | Build configuration     |
| `react-app/src/types/shopify.ts`        | Shopify data types      |
| `react-app/src/components/Homepage.tsx` | Main homepage component |
| `sections/react-homepage.liquid`        | Shopify section wrapper |
| `assets/react-homepage.js`              | Built React bundle      |

### Useful Links

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [Three.js Docs](https://threejs.org/docs/)
- [Shopify Liquid Reference](https://shopify.dev/docs/api/liquid)
