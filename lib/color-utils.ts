/**
 * Color Utility Functions
 * 
 * Utilities for parsing and generating OKLCH color variations.
 * OKLCH provides perceptually uniform colors across all shades.
 */

import { themeColors, shadeConfig, type ThemeColorName, type ShadeLevel } from './color-config';

/**
 * OKLCH color components
 */
interface OKLCHColor {
    lightness: number;  // 0-1
    chroma: number;     // 0-0.4 (typically)
    hue: number;        // 0-360
}

/**
 * Parse an OKLCH color string into components
 * @param colorString - Color string in format "oklch(L C H)"
 * @returns Parsed color components
 */
export function parseOKLCH(colorString: string): OKLCHColor {
    // Match oklch(L C H) or oklch(L C H / A)
    const match = colorString.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.%]+)?\)/);

    if (!match) {
        throw new Error(`Invalid OKLCH color string: ${colorString}`);
    }

    return {
        lightness: parseFloat(match[1]),
        chroma: parseFloat(match[2]),
        hue: parseFloat(match[3]),
    };
}

/**
 * Convert OKLCH components back to a CSS string
 * @param color - OKLCH color components
 * @returns CSS color string
 */
export function oklchToString(color: OKLCHColor): string {
    return `oklch(${color.lightness.toFixed(3)} ${color.chroma.toFixed(3)} ${color.hue.toFixed(3)})`;
}

/**
 * Generate a specific shade of a color
 * @param baseColor - Base OKLCH color string
 * @param targetLightness - Target lightness value (0-1)
 * @returns OKLCH color string at the target lightness
 */
export function generateShade(baseColor: string, targetLightness: number): string {
    const parsed = parseOKLCH(baseColor);

    // For very light shades, reduce chroma slightly for better pastels
    let adjustedChroma = parsed.chroma;
    if (targetLightness > 0.85) {
        adjustedChroma = parsed.chroma * 0.6;
    } else if (targetLightness > 0.75) {
        adjustedChroma = parsed.chroma * 0.8;
    }

    // For very dark shades, also reduce chroma slightly
    if (targetLightness < 0.2) {
        adjustedChroma = parsed.chroma * 0.9;
    }

    return oklchToString({
        lightness: targetLightness,
        chroma: adjustedChroma,
        hue: parsed.hue,
    });
}

/**
 * Generate all shade variations for a base color
 * @param baseColor - Base OKLCH color string
 * @returns Map of shade level to OKLCH color string
 */
export function generateAllShades(baseColor: string): Record<ShadeLevel, string> {
    const shades = {} as Record<ShadeLevel, string>;

    for (const [level, lightness] of Object.entries(shadeConfig)) {
        shades[parseInt(level) as ShadeLevel] = generateShade(baseColor, lightness);
    }

    return shades;
}

/**
 * Generate CSS custom property declarations for all theme colors
 * @returns CSS string with custom property declarations
 */
export function generateColorCSS(): string {
    const lines: string[] = [];

    // Generate shades for each theme color
    for (const [colorName, baseColor] of Object.entries(themeColors)) {
        const shades = generateAllShades(baseColor);

        lines.push(`  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} color shades */`);

        for (const [level, color] of Object.entries(shades)) {
            lines.push(`  --${colorName}-${level}: ${color};`);
        }

        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Generate dark mode variations
 * For dark mode, we typically want to:
 * - Reduce chroma slightly (less saturated)
 * - Adjust specific shades for better contrast
 */
export function generateDarkModeCSS(): string {
    const lines: string[] = [];

    for (const [colorName, baseColor] of Object.entries(themeColors)) {
        const parsed = parseOKLCH(baseColor);

        // Reduce chroma by 15% for dark mode
        const darkModeBase = oklchToString({
            ...parsed,
            chroma: parsed.chroma * 0.85,
        });

        const shades = generateAllShades(darkModeBase);

        lines.push(`  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} color shades (dark mode) */`);

        for (const [level, color] of Object.entries(shades)) {
            lines.push(`  --${colorName}-${level}: ${color};`);
        }

        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Generate semantic color mappings
 * Maps semantic names (primary, secondary) to theme colors
 */
export function generateSemanticMappings(mode: 'light' | 'dark'): string {
    const lines: string[] = [];

    if (mode === 'light') {
        lines.push('  /* Semantic color mappings - Light Mode */');
        lines.push('  --primary: var(--brand-600);');
        lines.push('  --primary-foreground: var(--brand-50);');
        lines.push('  --secondary: var(--neutral-100);');
        lines.push('  --secondary-foreground: var(--neutral-900);');
        lines.push('  --accent: var(--accent-500);');
        lines.push('  --accent-foreground: var(--accent-50);');
        lines.push('  --muted: var(--neutral-100);');
        lines.push('  --muted-foreground: var(--neutral-600);');
    } else {
        lines.push('  /* Semantic color mappings - Dark Mode */');
        lines.push('  --primary: var(--brand-400);');
        lines.push('  --primary-foreground: var(--brand-950);');
        lines.push('  --secondary: var(--neutral-800);');
        lines.push('  --secondary-foreground: var(--neutral-100);');
        lines.push('  --accent: var(--accent-400);');
        lines.push('  --accent-foreground: var(--accent-950);');
        lines.push('  --muted: var(--neutral-800);');
        lines.push('  --muted-foreground: var(--neutral-400);');
    }

    return lines.join('\n');
}
