/**
 * Theme Color Configuration
 * 
 * Define your 3 main theme colors here using OKLCH format.
 * These colors will be used to generate all shade variations automatically.
 */

export const themeColors = {
    // Primary brand color - vibrant purple/blue
    brand: 'oklch(0.55 0.25 260)',

    // Accent color - teal/cyan
    accent: 'oklch(0.65 0.20 180)',

    // Neutral color - warm gray
    neutral: 'oklch(0.50 0.02 260)',
} as const;

export type ThemeColorName = keyof typeof themeColors;

/**
 * Shade configuration
 * Defines how much to adjust lightness for each shade level
 */
export const shadeConfig = {
    50: 0.95,   // Extremely light
    100: 0.90,  // Very light
    200: 0.80,  // Light
    300: 0.70,  // Light-medium
    400: 0.60,  // Medium-light
    500: 0.50,  // Base/Medium (default)
    600: 0.40,  // Medium-dark
    700: 0.30,  // Dark
    800: 0.20,  // Very dark
    900: 0.15,  // Extremely dark
    950: 0.10,  // Almost black
} as const;

export type ShadeLevel = keyof typeof shadeConfig;
