# Header Banner Rollback Guide

This project currently includes a homepage announcement banner below the navbar.
The homepage behavior was intentionally customized so `navbar + banner` overlay the hero and scroll together.

If the banner is removed later, use this checklist to restore the exact previous behavior.

## Files Involved

- `layout/theme.liquid`
- `react-app/src/components/hero/Hero.tsx`
- `sections/header-group.json` (content/settings only)

## Rollback Checklist

1. In `layout/theme.liquid`, remove the homepage-specific override block titled:
   - `HOMEPAGE HEADER + ANNOUNCEMENT OVERLAY OVERRIDES`
2. In `layout/theme.liquid`, remove these homepage-specific rules:
   - `transform: translateY(...)` on `.section-background` / `.announcement-bar`
   - homepage `.announcement-bar` z-index override
   - homepage `#MainContent` negative `margin-top`
   - homepage transparent-header tint rules (`#header-component[transparent]...`)
3. In `react-app/src/components/hero/Hero.tsx`, restore these constants:

```ts
const featuredMediaHeightClass = 'md:h-[49vh] md:min-h-[25rem]';
const featuredContentOffsetClass = 'md:pt-[max(calc(49vh+2.5rem),27.5rem)]';
```

4. If needed, remove the announcement section from `sections/header-group.json` or set it disabled in Shopify Theme Editor.
5. Rebuild React assets after restoring hero constants:

```bash
cd react-app && pnpm build
```

## Why This Is Needed

When the banner exists and overlays the hero, the hero needs extra visual height compensation (`--header-group-height`) so it keeps its original perceived size.
Once the banner is removed, that compensation must be removed too.
