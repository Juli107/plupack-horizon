# Troubleshooting Guide

Common issues and their solutions.

---

## Build Issues

### "Cannot find module" Errors

**Symptom:**

```
Cannot find module '@components/Homepage'
```

**Solution:**
Ensure path aliases are configured in both `tsconfig.json` and `vite.config.ts`:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@components': resolve(__dirname, './src/components'),
  },
}
```

---

### TypeScript Errors with Three.js

**Symptom:**

```
Property 'rotation' does not exist on type 'never'
```

**Solution:**

1. Ensure `@types/three` matches your `three` version
2. Use proper typing for refs:

```typescript
import type { Mesh } from 'three';
const meshRef = useRef<Mesh>(null);
```

---

### Build Succeeds but Nothing Renders

**Symptom:**
Build completes but React app doesn't mount in Shopify.

**Checklist:**

1. Check browser console for errors
2. Verify mount element exists: `<div id="react-homepage"></div>`
3. Ensure script loads AFTER the mount element
4. Check if `window.SHOPIFY_DATA` is defined

---

## Shopify Issues

### Changes Not Syncing

**Symptom:**
You rebuilt React but Shopify preview shows old version.

**Solutions:**

1. Check Shopify CLI output for "Synced » update assets/..."
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Clear browser cache
4. Restart `shopify theme dev`

---

### Liquid Syntax Errors

**Symptom:**

```
Liquid syntax error: Unknown tag 'react'
```

**Solution:**
Liquid doesn't understand React. Only use standard Liquid tags. React code goes in the separate React app.

---

### JSON Parsing Errors

**Symptom:**

```
Unexpected token in JSON
```

**Solution:**
Always use `| json` filter when passing Liquid data:

```liquid
// ❌ Wrong
window.SHOPIFY_DATA = {
  name: {{ shop.name }}
};

// ✅ Correct
window.SHOPIFY_DATA = {
  name: {{ shop.name | json }}
};
```

---

## Three.js / R3F Issues

### Black Screen / Nothing Renders

**Checklist:**

1. Camera is positioned away from origin:

   ```jsx
   <Canvas camera={{ position: [0, 0, 5] }}>
   ```

2. Scene has lighting:

   ```jsx
   <ambientLight intensity={0.5} />
   <directionalLight position={[5, 5, 5]} />
   ```

3. Geometry and material are valid:
   ```jsx
   <mesh>
     <boxGeometry args={[1, 1, 1]} />
     <meshStandardMaterial color="red" />
   </mesh>
   ```

---

### WebGL Context Lost

**Symptom:**

```
WebGL: CONTEXT_LOST_WEBGL
```

**Solutions:**

1. Reduce polygon count
2. Dispose of unused geometries/materials
3. Limit simultaneous WebGL contexts (one Canvas per page)

---

### Performance Issues

**Symptom:**
Low FPS, stuttering animations.

**Solutions:**

1. **Limit pixel ratio:**

   ```jsx
   <Canvas dpr={[1, 2]}>
   ```

2. **Use instancedMesh for repeated objects:**

   ```jsx
   <instancedMesh args={[geometry, material, count]} />
   ```

3. **Optimize with Drei:**

   ```jsx
   import { Preload, PerformanceMonitor } from '@react-three/drei';
   ```

4. **Lazy load non-critical components:**
   ```jsx
   const Heavy = lazy(() => import('./HeavyComponent'));
   ```

---

## Development Environment

### pnpm Not Found

**Solution:**

```bash
npm install -g pnpm
```

---

### Shopify CLI Not Found

**Solution:**

```bash
npm install -g @shopify/cli @shopify/theme
```

---

### Port Already in Use

**Symptom:**

```
Port 3000 is already in use
```

**Solutions:**

1. Kill the process: `lsof -i :3000` then `kill -9 <PID>`
2. Use different port:
   ```typescript
   // vite.config.ts
   server: {
     port: 3001;
   }
   ```

---

## Common Mistakes

### Forgetting to Build

**Problem:** Editing React files but changes don't appear.

**Solution:** Always run `pnpm build` after React changes.

---

### Wrong Import Paths

**Problem:**

```typescript
// This won't work in built bundle
import { something } from './components/Something.tsx';
```

**Solution:**

```typescript
// Remove .tsx extension
import { something } from './components/Something';
```

---

### Mutating Props in R3F

**Problem:**

```typescript
// ❌ Don't mutate props
props.position.x += 1;

// ✅ Use refs
meshRef.current.position.x += 1;
```

---

## Getting Help

1. **Check console:** Browser DevTools → Console
2. **Check network:** Browser DevTools → Network (look for 404s)
3. **Check Shopify CLI:** Look for sync errors
4. **Search issues:**
   - [R3F GitHub Issues](https://github.com/pmndrs/react-three-fiber/issues)
   - [Drei GitHub Issues](https://github.com/pmndrs/drei/issues)
   - [Shopify Community](https://community.shopify.com/)
