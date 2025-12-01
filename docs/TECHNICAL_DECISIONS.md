# Technical Decisions & Considerations

This document explains the reasoning behind key technical decisions in this project.

---

## Why React Three Fiber Instead of Vanilla Three.js?

### The Problem with Vanilla Three.js in Shopify

Initially, we tried using vanilla Three.js directly in Liquid's `{% javascript %}` tags:

```javascript
// This approach had issues:
const script = document.createElement('script');
script.src =
  'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
```

**Issues encountered:**

1. ES modules (`import`) don't work reliably in Shopify's bundled JS
2. Dynamic imports from CDN are blocked by some browsers/CSP policies
3. The `.module.js` build doesn't expose `window.THREE`
4. No hot reload, poor DX

### The Solution: Pre-built React Bundle

By building React/R3F with Vite:

- ✅ All dependencies bundled into one file
- ✅ No runtime imports needed
- ✅ Works in all browsers
- ✅ Familiar React DX with hot reload (in dev mode)
- ✅ Access to Drei's excellent helpers

---

## Why Not Use TresJS (Vue)?

We considered TresJS, which is "React Three Fiber for Vue":

| Aspect         | React/R3F                 | Vue/TresJS                 |
| -------------- | ------------------------- | -------------------------- |
| Community      | Larger                    | Smaller                    |
| Helpers (Drei) | More mature               | Cientos (similar)          |
| Learning curve | Lower (if you know React) | Higher (if you know React) |
| Bundle size    | Similar                   | Similar                    |
| TypeScript     | Excellent                 | Good                       |

**Decision:** Since the developer was already familiar with React/R3F/Drei, we chose that stack to minimize learning curve and maximize productivity.

---

## Why Separate React App vs. Inline Scripts?

### Option A: Inline in Liquid (Rejected)

```liquid
{% javascript %}
  // All code inline
  const scene = new THREE.Scene()
  // ... hundreds of lines
{% endjavascript %}
```

**Problems:**

- No TypeScript
- No imports/modules
- No hot reload
- No component reusability
- Difficult to maintain

### Option B: Separate React App (Chosen)

```
react-app/
├── src/
│   ├── components/
│   └── entries/
└── vite.config.ts
```

**Benefits:**

- Full TypeScript support
- Modern React development
- Hot reload in dev mode
- Component-based architecture
- Easy to test and maintain
- Standard tooling (ESLint, Prettier, etc.)

---

## Data Flow: Liquid → React

### Why `window.SHOPIFY_DATA`?

We needed a way to pass dynamic Shopify data (products, settings, cart) to React.

**Options considered:**

1. **API calls from React** ❌

   - Adds latency
   - Requires authentication handling
   - More complex

2. **Data attributes** ❌

   - Limited to strings
   - Hard to pass complex objects

3. **Global window object** ✅
   - Simple and fast
   - Works with any data type (via JSON)
   - Data available immediately on mount

### The Pattern

```liquid
<!-- 1. Liquid injects data BEFORE React loads -->
<script>
  window.SHOPIFY_DATA = {
    shop: {{ shop | json }},
    product: {{ product | json }}
  };
</script>

<!-- 2. React bundle loads and reads the data -->
<script src="{{ 'bundle.js' | asset_url }}" defer></script>
```

```typescript
// 3. React reads on mount
const data = window.SHOPIFY_DATA;
```

### Type Safety

We created TypeScript interfaces for all Shopify data:

```typescript
// src/types/shopify.ts
export interface ShopifyData {
  shop?: ShopifyShop;
  product?: ShopifyProduct;
  // ...
}
```

This catches errors at build time rather than runtime.

---

## Bundle Strategy

### Single Entry Point per Section

```typescript
// vite.config.ts
input: {
  'react-homepage': resolve(__dirname, 'src/entries/homepage.tsx'),
  'react-product-viewer': resolve(__dirname, 'src/entries/product-viewer.tsx'),
}
```

**Why separate bundles?**

- Pages only load what they need
- Faster initial load
- Better caching (unchanged bundles stay cached)

### Output Location

```typescript
outDir: '../assets',
emptyOutDir: false,  // IMPORTANT: Don't delete other assets!
```

Builds directly to Shopify's assets folder. The `emptyOutDir: false` is critical - without it, Vite would delete all other assets!

---

## Why Keep Header/Footer in Liquid?

### The Temptation

It's tempting to build everything in React for consistency:

```jsx
// Full SPA approach (NOT recommended)
<App>
  <Header /> {/* React */}
  <Hero3D /> {/* React */}
  <ProductGrid /> {/* React */}
  <Footer /> {/* React */}
</App>
```

### The Reality

Shopify provides significant value in Liquid:

| Feature       | In React      | In Liquid       |
| ------------- | ------------- | --------------- |
| Cart drawer   | Must rebuild  | Native          |
| Account pages | Must rebuild  | Native          |
| Checkout      | Cannot access | Native          |
| Menus         | Must sync     | Theme editor    |
| SEO           | Client-side   | Server-rendered |
| Search        | Must rebuild  | Native          |

### The Decision

Use React as "islands" for interactive content. For the homepage specifically, React controls the entire experience:

```
┌──────────────────────────┐
│  Header (Liquid)         │  ← Shopify native
├──────────────────────────┤
│                          │
│  Interactive Homepage    │  ← Full React experience
│  (React + R3F + GSAP)    │     - Lenis smooth scroll
│  - Hero with 3D          │     - GSAP ScrollTrigger
│  - Scroll sections       │     - 3D scenes (R3F)
│  - Animations            │     - Layered 2D/3D
│                          │
├──────────────────────────┤
│  Footer (Liquid)         │  ← Shopify native
└──────────────────────────┘
```

---

## Package Versions

### Why Latest Versions?

We upgraded to the latest versions:

```json
{
  "react": "^19.2.0",
  "three": "^0.181.2",
  "@react-three/fiber": "^9.4.2",
  "@react-three/drei": "^10.7.7"
}
```

**Reasons:**

- React 19 has better performance
- Three.js 0.181 has WebGPU support
- R3F 9.x has React 19 compatibility
- Drei 10.x matches R3F 9.x

### Version Alignment

Always keep these in sync:

- `three` and `@types/three` (same minor version)
- `@react-three/fiber` and `@react-three/drei` (compatible majors)

---

## TypeScript Configuration

### Why Strict Mode?

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Catches common errors:

- Null/undefined access
- Unused code
- Type mismatches

### Path Aliases

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@components/*": ["src/components/*"]
  }
}
```

Enables clean imports:

```typescript
// Instead of: import { Hero } from '../../../components/Hero'
import { Hero } from '@components/Hero';
```

---

## Why Lenis + GSAP for Scroll Animations?

### The Problem with Native Scroll

Native browser scroll is jerky and hard to synchronize with animations. For a premium interactive experience, we need:

1. **Smooth momentum scrolling** (like iOS)
2. **Scroll position control** for animations
3. **Synchronized 2D/3D animations** tied to scroll

### Why Lenis?

| Option            | Pros                               | Cons                   |
| ----------------- | ---------------------------------- | ---------------------- |
| Native scroll     | Simple, accessible                 | Jerky, hard to control |
| Locomotive Scroll | Popular, feature-rich              | Heavy, complex         |
| **Lenis**         | Lightweight, smooth, GSAP-friendly | Less features          |

Lenis was chosen for:

- Tiny bundle size (~4KB)
- Native-like feel with momentum
- Built-in GSAP ScrollTrigger integration
- Doesn't hijack scrollbar (accessible)

### Why GSAP over Framer Motion?

| Aspect         | GSAP               | Framer Motion |
| -------------- | ------------------ | ------------- |
| ScrollTrigger  | Built-in, powerful | Limited       |
| Timeline       | Excellent          | Basic         |
| Performance    | Optimized          | Good          |
| Learning curve | Moderate           | Lower         |
| Bundle size    | Larger             | Smaller       |

GSAP was chosen because:

- ScrollTrigger is industry-standard for scroll animations
- Better control over complex timelines
- Works seamlessly with Lenis
- `@gsap/react` provides proper cleanup

### Connecting Scroll to 3D

The key challenge: GSAP runs in React's world, but R3F's `useFrame` runs in Three.js's render loop.

**Solution:** Shared ref pattern

```typescript
// GSAP updates this ref on scroll
const scrollProgress = useRef(0);

ScrollTrigger.onUpdate = (self) => {
  scrollProgress.current = self.progress;
};

// R3F reads it every frame
useFrame(() => {
  mesh.position.y = scrollProgress.current * -5;
});
```

This avoids re-renders while keeping 3D in sync with scroll.

---

## Future Considerations

### WebGPU Support

Three.js 0.181+ supports WebGPU. To enable:

```typescript
import { WebGPURenderer } from 'three/webgpu';
// Requires additional setup
```

**Note:** WebGPU is not yet supported in all browsers. Use feature detection.

### Code Splitting

Current bundle is ~1.1MB. To reduce:

```typescript
// Lazy load heavy components
const ProductViewer = lazy(() => import('./ProductViewer'));
```

### Shared Chunks

For multiple entry points sharing Three.js:

```typescript
output: {
  manualChunks: {
    'three-core': ['three'],
    'r3f-core': ['@react-three/fiber']
  }
}
```

This creates shared chunks loaded once and cached.
