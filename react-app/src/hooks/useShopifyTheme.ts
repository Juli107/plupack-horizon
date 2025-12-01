/**
 * useShopifyTheme - React hook for accessing Shopify theme settings
 *
 * This hook provides access to theme-wide settings defined in Shopify Admin:
 * - Fonts (body, heading, subheading, accent)
 * - Font sizes (h1-h6, paragraph)
 * - Button styles (primary, secondary)
 * - Colors (background, foreground, primary, border)
 * - Border radius (buttons, inputs, cards)
 *
 * SINGLE SOURCE OF TRUTH:
 * All values come from Shopify Theme Settings, so you only configure
 * fonts/colors/buttons in ONE place (Theme Editor), and React uses them.
 *
 * USAGE:
 * const { fonts, buttons, colors, getFontFamily } = useShopifyTheme();
 *
 * // Use in inline styles
 * <h1 style={{ fontFamily: getFontFamily('heading') }}>Hello</h1>
 *
 * // Use button styles
 * <button style={{
 *   background: buttons.primary.background,
 *   color: buttons.primary.text
 * }}>
 *   Click Me
 * </button>
 */

import { useMemo } from 'react';
import {
  getTheme,
  getFontFamily as getFontFamilyUtil,
  type ShopifyTheme,
} from '../types/shopify';

export interface UseShopifyThemeReturn extends ShopifyTheme {
  /** Get CSS font-family string for a font type */
  getFontFamily: (
    type: 'body' | 'heading' | 'subheading' | 'accent'
  ) => string;

  /** Get font size in pixels */
  getFontSize: (
    type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  ) => string;

  /** Get complete heading styles object */
  getHeadingStyle: (
    level: 1 | 2 | 3 | 4 | 5 | 6
  ) => React.CSSProperties;

  /** Get complete body text styles object */
  getBodyStyle: () => React.CSSProperties;

  /** Get primary button styles object */
  getPrimaryButtonStyle: () => React.CSSProperties;

  /** Get secondary button styles object */
  getSecondaryButtonStyle: () => React.CSSProperties;
}

export function useShopifyTheme(): UseShopifyThemeReturn {
  const theme = useMemo(() => getTheme(), []);

  const getFontFamily = (
    type: 'body' | 'heading' | 'subheading' | 'accent'
  ): string => {
    return getFontFamilyUtil(theme.fonts[type]);
  };

  const getFontSize = (
    type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  ): string => {
    return `${theme.fontSizes[type]}px`;
  };

  const getHeadingStyle = (
    level: 1 | 2 | 3 | 4 | 5 | 6
  ): React.CSSProperties => {
    const sizeKey = `h${level}` as keyof typeof theme.fontSizes;
    return {
      fontFamily: getFontFamily('heading'),
      fontWeight: theme.fonts.heading.weight,
      fontStyle: theme.fonts.heading.style,
      fontSize: `${theme.fontSizes[sizeKey]}px`,
      color: theme.colors.foregroundHeading,
    };
  };

  const getBodyStyle = (): React.CSSProperties => ({
    fontFamily: getFontFamily('body'),
    fontWeight: theme.fonts.body.weight,
    fontStyle: theme.fonts.body.style,
    fontSize: `${theme.fontSizes.paragraph}px`,
    color: theme.colors.foreground,
  });

  const getPrimaryButtonStyle = (): React.CSSProperties => ({
    backgroundColor: theme.buttons.primary.background,
    color: theme.buttons.primary.text,
    borderColor: theme.buttons.primary.border,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: theme.borderRadius.buttons
      ? `${theme.borderRadius.buttons}px`
      : '0',
    cursor: 'pointer',
    padding: '12px 24px',
    fontFamily: getFontFamily('body'),
    fontWeight: '600',
  });

  const getSecondaryButtonStyle = (): React.CSSProperties => ({
    backgroundColor:
      theme.buttons.secondary.background || 'transparent',
    color: theme.buttons.secondary.text,
    borderColor: theme.buttons.secondary.border,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: theme.borderRadius.buttons
      ? `${theme.borderRadius.buttons}px`
      : '0',
    cursor: 'pointer',
    padding: '12px 24px',
    fontFamily: getFontFamily('body'),
    fontWeight: '600',
  });

  return {
    ...theme,
    getFontFamily,
    getFontSize,
    getHeadingStyle,
    getBodyStyle,
    getPrimaryButtonStyle,
    getSecondaryButtonStyle,
  };
}

// Also export a non-hook version for use outside React components
export { getTheme, getFontFamilyUtil as getFontFamily };
