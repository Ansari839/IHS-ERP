# Color Management System - User Guide

## Overview

This ERP application now uses a comprehensive color management system based on **3 main theme colors**. All color variations are automatically generated using JavaScript utilities, ensuring consistency across light and dark modes.

## 🎨 The 3 Main Colors

The color system is built around three base colors defined in [`lib/color-config.ts`](file:///home/abdullah/SpecKit%20Plus/erp/lib/color-config.ts):

1. **Brand** (`--theme-brand`) - Purple/Blue - Primary brand identity
2. **Accent** (`--theme-accent`) - Teal/Cyan - Secondary/accent elements
3. **Neutral** (`--theme-neutral`) - Warm Gray - Backgrounds and text

## 📊 Automatic Shade Generation

Each main color is automatically expanded into **11 shades** (50-950):
- `50` - Extremely light (perfect for backgrounds)
- `100-400` - Light to medium-light (backgrounds, subtle elements)
- `500` - Base color (balanced, medium intensity)
- `600-900` - Medium-dark to dark (text, emphasis)
- `950` - Almost black (maximum contrast)

## 🔧 How to Use Colors

### In CSS (Custom Properties)

Use CSS custom properties directly:

```css
.my-component {
  background-color: var(--brand-500);
  color: var(--neutral-50);
  border-color: var(--accent-300);
}
```

### In Tailwind Classes

Use Tailwind utility classes with the color names:

```tsx
<div className="bg-brand-600 text-brand-50">
  Primary Button
</div>

<div className="bg-accent-100 text-accent-900 border-accent-300">
  Accent Card
</div>

<div className="bg-neutral-100 text-neutral-900">
  Neutral Background
</div>
```

### Available Tailwind Classes

For each color (`brand`, `accent`, `neutral`), you can use:
- `bg-{color}-{shade}` - Background color
- `text-{color}-{shade}` - Text color
- `border-{color}-{shade}` - Border color
- `ring-{color}-{shade}` - Ring color
- And all other Tailwind color utilities

## 🌓 Dark Mode Support

The color system automatically adapts to dark mode. When the `.dark` class is applied to the root element:

- **Chroma is reduced** by 15% for reduced eye strain
- **Semantic mappings** are inverted (lighter shades for text, darker for backgrounds)
- **All colors maintain** their hue and relative relationships

You don't need to do anything special - the colors just work in both modes!

## 🎯 Semantic Color Names

For convenience, semantic names are mapped to the theme colors:

### Light Mode
- `primary` → `brand-600`
- `secondary` → `neutral-100`
- `accent` → `accent-500`
- `muted` → `neutral-100`
- `background` → `neutral-50`
- `foreground` → `neutral-950`

### Dark Mode
- `primary` → `brand-400`
- `secondary` → `neutral-800`
- `accent` → `accent-400`
- `muted` → `neutral-800`
- `background` → `neutral-950`
- `foreground` → `neutral-50`

Use these in components for consistency:

```tsx
<button className="bg-primary text-primary-foreground">
  Primary Button
</button>

<div className="bg-muted text-muted-foreground">
  Muted Section
</div>
```

## 🔨 Customizing Colors

### Changing the Main Colors

To change the main theme colors, edit [`lib/color-config.ts`](file:///home/abdullah/SpecKit%20Plus/erp/lib/color-config.ts):

```typescript
export const themeColors = {
  brand: 'oklch(0.55 0.25 260)',    // Change these values
  accent: 'oklch(0.65 0.20 180)',   // Change these values
  neutral: 'oklch(0.50 0.02 260)',  // Change these values
} as const;
```

**OKLCH Format**: `oklch(lightness chroma hue)`
- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (gray) to ~0.4 (vivid)
- **Hue**: 0-360 degrees (color wheel)

### Regenerating Colors

After changing the base colors:

1. Run the generation script to see the output:
   ```bash
   npx tsx scripts/generate-colors.ts
   ```

2. Copy the generated CSS into [`app/globals.css`](file:///home/abdullah/SpecKit%20Plus/erp/app/globals.css)

3. The colors will automatically update throughout the app!

## 📝 Technical Details

### File Structure

```
lib/
├── color-config.ts      # 3 main colors + shade configuration
├── color-utils.ts       # Parsing & generation utilities
scripts/
└── generate-colors.ts   # Color generation script
app/
└── globals.css          # Final CSS with all colors
```

### Color Generation Logic

1. **Parse** OKLCH color string into components
2. **Generate** 11 shades by adjusting lightness
3. **Adjust** chroma for very light/dark shades
4. **Create** dark mode variants (reduce chroma by 15%)
5. **Map** semantic names to appropriate shades

### Why OKLCH?

OKLCH (OK Lab Color + Hue) provides:
- **Perceptual uniformity** - Equal changes = equal visual differences
- **Wide gamut** - Access to vivid, modern colors
- **Predictable** - Lightness changes work as expected
- **Future-proof** - Native browser support

## 🎨 Color Palette Reference

### Brand (Purple/Blue)
- Used for: Primary actions, links, focus states
- Examples: Buttons, active navigation, selected items

### Accent (Teal/Cyan)
- Used for: Secondary actions, highlights, info states
- Examples: Badges, secondary buttons, info alerts

### Neutral (Warm Gray)
- Used for: Backgrounds, text, borders, dividers
- Examples: Page backgrounds, text content, cards

## ✨ Best Practices

1. **Use semantic names** when possible (`primary`, `muted`, etc.)
2. **Use specific shades** when you need precise control
3. **Test in both modes** to ensure readability
4. **Maintain contrast** - check WCAG guidelines
5. **Be consistent** - use the same shades for similar elements

## 🚀 Examples

### Primary Button
```tsx
<button className="bg-brand-600 hover:bg-brand-700 text-brand-50 px-4 py-2 rounded-lg">
  Click Me
</button>
```

### Info Card
```tsx
<div className="bg-accent-50 border border-accent-200 text-accent-900 p-4 rounded-lg">
  <h3 className="text-accent-700 font-semibold">Information</h3>
  <p>This is an informational message.</p>
</div>
```

### Subtle Section
```tsx
<section className="bg-neutral-100 text-neutral-900 p-8">
  <h2 className="text-neutral-700">Subtitle</h2>
  <p className="text-neutral-600">Description text...</p>
</section>
```

---

**Questions?** The color system is fully documented in the code. Check:
- [`lib/color-config.ts`](file:///home/abdullah/SpecKit%20Plus/erp/lib/color-config.ts) for the main colors
- [`lib/color-utils.ts`](file:///home/abdullah/SpecKit%20Plus/erp/lib/color-utils.ts) for generation logic
- [`app/globals.css`](file:///home/abdullah/SpecKit%20Plus/erp/app/globals.css) for all available colors
