// Types for Shopify data injected via Liquid
export interface ShopifyShop {
  name: string;
  currency: string;
  domain: string;
}

export interface ShopifySettings {
  backgroundColor: string;
  accentColor: string;
  headingText: string;
  subheadingText: string;
}

// ============================================
// THEME-WIDE SETTINGS (single source of truth)
// ============================================

export interface FontConfig {
  family: string;
  fallback: string;
  weight: string;
  style: string;
}

export interface ThemeFonts {
  body: FontConfig;
  heading: FontConfig;
  subheading: FontConfig;
  accent: FontConfig;
}

export interface ThemeFontSizes {
  paragraph: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
}

export interface ButtonStyle {
  background: string;
  text: string;
  border: string;
  hoverBackground?: string;
  hoverText?: string;
  borderRadius?: string;
}

export interface ThemeButtons {
  primary: ButtonStyle;
  secondary: ButtonStyle;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  foregroundHeading: string;
  primary: string;
  border: string;
}

export interface ThemeBorderRadius {
  buttons: string;
  inputs: string;
  cards: string;
}

export interface ShopifyTheme {
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  buttons: ThemeButtons;
  colors: ThemeColors;
  borderRadius: ThemeBorderRadius;
}

// ============================================

export interface ShopifyProduct {
  title: string;
  price: string;
  images: string[];
  handle: string;
}

export interface ShopifyCollection {
  title: string;
  productsCount: number;
}

export interface ShopifyCustomer {
  firstName: string;
  email: string;
}

export interface ShopifyCart {
  itemCount: number;
  totalPrice: string;
}

export interface ShopifyRoutes {
  cart: string;
  collections: string;
  allProducts: string;
}

export interface ShopifyData {
  shop?: ShopifyShop;
  settings?: ShopifySettings;
  theme?: ShopifyTheme;
  product?: ShopifyProduct;
  collection?: ShopifyCollection;
  customer?: ShopifyCustomer;
  cart?: ShopifyCart;
  routes?: ShopifyRoutes;
  sectionId?: string;
}

// Extend Window interface
declare global {
  interface Window {
    SHOPIFY_DATA?: ShopifyData;
  }
}

// Helper to get Shopify data with defaults
export function getShopifyData(): ShopifyData {
  return window.SHOPIFY_DATA ?? {};
}

// ============================================
// HELPER: Build CSS font-family string
// ============================================
export function getFontFamily(font: FontConfig | undefined): string {
  if (!font) return 'system-ui, sans-serif';
  return `"${font.family}", ${font.fallback}`;
}

// ============================================
// HELPER: Get theme with defaults
// ============================================
export function getThemeDefaults(): ShopifyTheme {
  return {
    fonts: {
      body: {
        family: 'Open Sans',
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
      subheading: {
        family: 'Montserrat',
        fallback: 'sans-serif',
        weight: '500',
        style: 'normal',
      },
      accent: {
        family: 'Montserrat',
        fallback: 'sans-serif',
        weight: '700',
        style: 'normal',
      },
    },
    fontSizes: {
      paragraph: '14',
      h1: '48',
      h2: '36',
      h3: '24',
      h4: '20',
      h5: '16',
      h6: '14',
    },
    buttons: {
      primary: {
        background: '#000F9F',
        text: '#FFFFFF',
        border: '#000F9F',
      },
      secondary: {
        background: 'transparent',
        text: '#000000',
        border: '#000000',
      },
    },
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
      foregroundHeading: '#000000',
      primary: '#000F9F',
      border: '#E6E6E6',
    },
    borderRadius: {
      buttons: '0',
      inputs: '0',
      cards: '0',
    },
  };
}

export function getTheme(): ShopifyTheme {
  const data = getShopifyData();
  const defaults = getThemeDefaults();

  if (!data.theme) return defaults;

  // Deep merge with defaults
  return {
    fonts: { ...defaults.fonts, ...data.theme.fonts },
    fontSizes: { ...defaults.fontSizes, ...data.theme.fontSizes },
    buttons: {
      primary: {
        ...defaults.buttons.primary,
        ...data.theme.buttons?.primary,
      },
      secondary: {
        ...defaults.buttons.secondary,
        ...data.theme.buttons?.secondary,
      },
    },
    colors: { ...defaults.colors, ...data.theme.colors },
    borderRadius: {
      ...defaults.borderRadius,
      ...data.theme.borderRadius,
    },
  };
}
