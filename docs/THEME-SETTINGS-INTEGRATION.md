# Theme Settings Integration

## Single Source of Truth Architecture

This project uses **Shopify Theme Settings** as the single source of truth for:

- Fonts (body, heading, subheading, accent)
- Font sizes (h1-h6, paragraph)
- Colors (background, foreground, primary, border)
- Button styles (primary, secondary)
- Border radius (buttons, inputs, cards)

React components **automatically inherit** these values — you never need to manually sync fonts or colors.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│           Shopify Admin > Theme Settings                    │
│  (Typography, Colors, Buttons, etc.)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 settings_data.json                          │
│  (Persisted theme configuration)                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Liquid Templates       │    │   react-homepage.liquid  │
│   (Header, Footer, etc)  │    │   window.SHOPIFY_DATA    │
│                          │    │                          │
│   Uses CSS variables:    │    │   Passes to React:       │
│   var(--font-body)       │    │   theme.fonts.body       │
│   var(--color-primary)   │    │   theme.colors.primary   │
└──────────────────────────┘    └────────────┬─────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   React Components       │
                               │   useShopifyTheme()      │
                               │                          │
                               │   getFontFamily('body')  │
                               │   getPrimaryButtonStyle()│
                               └──────────────────────────┘
```

## Available Theme Data

### Fonts

| Setting         | React Access                  | Description    |
| --------------- | ----------------------------- | -------------- |
| Body font       | `getFontFamily('body')`       | Main text font |
| Heading font    | `getFontFamily('heading')`    | h1-h6 headings |
| Subheading font | `getFontFamily('subheading')` | Subheadings    |
| Accent font     | `getFontFamily('accent')`     | Special text   |

**Note:** Shopify loads the fonts automatically. React just uses the font-family names — no duplicate font loading!

### Font Sizes

```typescript
const { fontSizes } = useShopifyTheme();
// fontSizes.h1 → "48"
// fontSizes.paragraph → "14"
```

### Colors

```typescript
const { colors } = useShopifyTheme();
// colors.background
// colors.foreground
// colors.foregroundHeading
// colors.primary
// colors.border
```

### Button Styles

```typescript
const { getPrimaryButtonStyle, getSecondaryButtonStyle } =
  useShopifyTheme();

// Returns complete CSS properties object:
<button style={getPrimaryButtonStyle()}>Click Me</button>;
```

## Usage in React Components

### Basic Usage

```tsx
import { useShopifyTheme } from '../hooks/useShopifyTheme';

function MyComponent() {
  const {
    getFontFamily,
    getHeadingStyle,
    getPrimaryButtonStyle,
    colors,
  } = useShopifyTheme();

  return (
    <div style={{ fontFamily: getFontFamily('body') }}>
      <h1 style={getHeadingStyle(1)}>Hello World</h1>
      <p style={{ color: colors.foreground }}>
        Body text using theme settings
      </p>
      <button style={getPrimaryButtonStyle()}>
        Theme-styled button
      </button>
    </div>
  );
}
```

### Helper Functions

| Function                    | Returns         | Usage                     |
| --------------------------- | --------------- | ------------------------- |
| `getFontFamily(type)`       | `string`        | CSS font-family value     |
| `getFontSize(type)`         | `string`        | e.g., "48px"              |
| `getHeadingStyle(level)`    | `CSSProperties` | Complete heading styles   |
| `getBodyStyle()`            | `CSSProperties` | Complete body text styles |
| `getPrimaryButtonStyle()`   | `CSSProperties` | Primary button styles     |
| `getSecondaryButtonStyle()` | `CSSProperties` | Secondary button styles   |

## Customizing the Header

The header uses CSS variables from Shopify theme, plus custom overrides in `assets/header-blur.css`:

```css
/* Uses Shopify's body font */
.header .menu-list__link {
  font-family: var(
    --font-body--family,
    system-ui,
    sans-serif
  ) !important;
  font-weight: 600 !important;
  font-size: 18px !important;
}
```

To change the header font:

1. Go to Theme Settings > Typography
2. Change the Body or Heading font
3. The header automatically updates

## What Gets Passed to React

The `react-homepage.liquid` file injects this data:

```javascript
window.SHOPIFY_DATA = {
  theme: {
    fonts: {
      body: {
        family: 'Work Sans',
        fallback: 'sans-serif',
        weight: '400',
        style: 'normal',
      },
      heading: {
        family: 'Montserrat',
        fallback: 'sans-serif',
        weight: '700',
        style: 'normal',
      },
      // ...
    },
    fontSizes: {
      paragraph: '14',
      h1: '48',
      // ...
    },
    buttons: {
      primary: {
        background: '#000F9F',
        text: '#FFFFFF',
        border: '#000F9F',
      },
      secondary: {
        /* ... */
      },
    },
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
      primary: '#000F9F',
      // ...
    },
    borderRadius: {
      buttons: '4',
      inputs: '4',
      cards: '8',
    },
  },
};
```

## Workflow Summary

1. **Configure once** in Shopify Admin > Theme Settings
2. **Liquid templates** use CSS variables (automatically)
3. **React components** use `useShopifyTheme()` hook
4. **Everything stays in sync** — no manual duplication!

## Adding New Theme Settings

To expose additional theme settings to React:

1. Edit `sections/react-homepage.liquid`
2. Add the setting to `window.SHOPIFY_DATA.theme`
3. Update types in `react-app/src/types/shopify.ts`
4. Use in components via `useShopifyTheme()`

Example:

```liquid
// In react-homepage.liquid
theme: {
  // ... existing settings
  customSetting: {{ settings.my_custom_setting | json }}
}
```
