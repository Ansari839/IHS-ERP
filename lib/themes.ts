export type ThemeColor = {
    name: string
    label: string
    activeColor: string
    previewColors: string[]
    cssVars: {
        light: {
            "--brand-hue": string
            "--accent-hue": string
            "--neutral-hue": string
        }
        dark: {
            "--brand-hue": string
            "--accent-hue": string
            "--neutral-hue": string
        }
    }
}

export const THEME_COLORS: ThemeColor[] = [
    // --- Standard Colors ---
    {
        name: "blue",
        label: "Blue",
        activeColor: "oklch(0.55 0.25 260)",
        previewColors: ["oklch(0.55 0.25 260)", "oklch(0.55 0.25 326)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "260", "--accent-hue": "326", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "260", "--accent-hue": "180", "--neutral-hue": "240" },
        },
    },
    {
        name: "emerald",
        label: "Emerald",
        activeColor: "oklch(0.55 0.25 158)",
        previewColors: ["oklch(0.55 0.25 158)", "oklch(0.55 0.25 260)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "158", "--accent-hue": "260", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "158", "--accent-hue": "260", "--neutral-hue": "240" },
        },
    },
    {
        name: "violet",
        label: "Violet",
        activeColor: "oklch(0.55 0.25 270)",
        previewColors: ["oklch(0.55 0.25 270)", "oklch(0.55 0.25 320)", "oklch(0.15 0.02 250)", "oklch(0.98 0.002 250)"],
        cssVars: {
            light: { "--brand-hue": "270", "--accent-hue": "320", "--neutral-hue": "250" }, // Slate
            dark: { "--brand-hue": "270", "--accent-hue": "320", "--neutral-hue": "250" },
        },
    },
    {
        name: "amber",
        label: "Amber",
        activeColor: "oklch(0.55 0.25 45)",
        previewColors: ["oklch(0.55 0.25 45)", "oklch(0.55 0.25 20)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "45", "--accent-hue": "20", "--neutral-hue": "60" }, // Stone
            dark: { "--brand-hue": "45", "--accent-hue": "20", "--neutral-hue": "60" },
        },
    },
    {
        name: "rose",
        label: "Rose",
        activeColor: "oklch(0.55 0.25 350)",
        previewColors: ["oklch(0.55 0.25 350)", "oklch(0.55 0.25 20)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "350", "--accent-hue": "20", "--neutral-hue": "60" }, // Stone
            dark: { "--brand-hue": "350", "--accent-hue": "20", "--neutral-hue": "60" },
        },
    },
    {
        name: "cyan",
        label: "Cyan",
        activeColor: "oklch(0.55 0.25 190)",
        previewColors: ["oklch(0.55 0.25 190)", "oklch(0.55 0.25 260)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "190", "--accent-hue": "260", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "190", "--accent-hue": "260", "--neutral-hue": "240" },
        },
    },
    {
        name: "orange",
        label: "Orange",
        activeColor: "oklch(0.55 0.25 30)",
        previewColors: ["oklch(0.55 0.25 30)", "oklch(0.55 0.25 350)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "30", "--accent-hue": "350", "--neutral-hue": "60" }, // Stone
            dark: { "--brand-hue": "30", "--accent-hue": "350", "--neutral-hue": "60" },
        },
    },
    {
        name: "teal",
        label: "Teal",
        activeColor: "oklch(0.55 0.25 175)",
        previewColors: ["oklch(0.55 0.25 175)", "oklch(0.55 0.25 150)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "175", "--accent-hue": "150", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "175", "--accent-hue": "150", "--neutral-hue": "240" },
        },
    },
    {
        name: "indigo",
        label: "Indigo",
        activeColor: "oklch(0.55 0.25 240)",
        previewColors: ["oklch(0.55 0.25 240)", "oklch(0.55 0.25 280)", "oklch(0.15 0.02 250)", "oklch(0.98 0.002 250)"],
        cssVars: {
            light: { "--brand-hue": "240", "--accent-hue": "280", "--neutral-hue": "250" }, // Slate
            dark: { "--brand-hue": "240", "--accent-hue": "280", "--neutral-hue": "250" },
        },
    },
    {
        name: "fuchsia",
        label: "Fuchsia",
        activeColor: "oklch(0.55 0.25 300)",
        previewColors: ["oklch(0.55 0.25 300)", "oklch(0.55 0.25 260)", "oklch(0.15 0.02 250)", "oklch(0.98 0.002 250)"],
        cssVars: {
            light: { "--brand-hue": "300", "--accent-hue": "260", "--neutral-hue": "250" }, // Slate
            dark: { "--brand-hue": "300", "--accent-hue": "260", "--neutral-hue": "250" },
        },
    },
    {
        name: "lime",
        label: "Lime",
        activeColor: "oklch(0.55 0.25 130)",
        previewColors: ["oklch(0.55 0.25 130)", "oklch(0.55 0.25 160)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "130", "--accent-hue": "160", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "130", "--accent-hue": "160", "--neutral-hue": "240" },
        },
    },
    {
        name: "pink",
        label: "Pink",
        activeColor: "oklch(0.55 0.25 330)",
        previewColors: ["oklch(0.55 0.25 330)", "oklch(0.55 0.25 280)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "330", "--accent-hue": "280", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "330", "--accent-hue": "280", "--neutral-hue": "240" },
        },
    },
    {
        name: "red",
        label: "Red",
        activeColor: "oklch(0.55 0.25 20)",
        previewColors: ["oklch(0.55 0.25 20)", "oklch(0.55 0.25 350)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "20", "--accent-hue": "350", "--neutral-hue": "60" }, // Stone
            dark: { "--brand-hue": "20", "--accent-hue": "350", "--neutral-hue": "60" },
        },
    },

    // --- Neutrals ---
    {
        name: "slate",
        label: "Slate",
        activeColor: "oklch(0.55 0.10 250)",
        previewColors: ["oklch(0.55 0.10 250)", "oklch(0.55 0.10 200)", "oklch(0.15 0.02 250)", "oklch(0.98 0.002 250)"],
        cssVars: {
            light: { "--brand-hue": "250", "--accent-hue": "200", "--neutral-hue": "250" },
            dark: { "--brand-hue": "250", "--accent-hue": "200", "--neutral-hue": "250" },
        },
    },
    {
        name: "zinc",
        label: "Zinc",
        activeColor: "oklch(0.55 0.05 240)",
        previewColors: ["oklch(0.55 0.05 240)", "oklch(0.55 0.05 200)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "240", "--accent-hue": "200", "--neutral-hue": "240" },
            dark: { "--brand-hue": "240", "--accent-hue": "200", "--neutral-hue": "240" },
        },
    },
    {
        name: "stone",
        label: "Stone",
        activeColor: "oklch(0.55 0.05 60)",
        previewColors: ["oklch(0.55 0.05 60)", "oklch(0.55 0.05 30)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "60", "--accent-hue": "30", "--neutral-hue": "60" },
            dark: { "--brand-hue": "60", "--accent-hue": "30", "--neutral-hue": "60" },
        },
    },

    // --- Trending / Named Themes ---
    {
        name: "dracula",
        label: "Dracula",
        activeColor: "oklch(0.55 0.25 265)",
        previewColors: ["oklch(0.55 0.25 265)", "oklch(0.55 0.25 330)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "265", "--accent-hue": "330", "--neutral-hue": "240" }, // Zinc/Dark Grey
            dark: { "--brand-hue": "265", "--accent-hue": "330", "--neutral-hue": "240" },
        },
    },
    {
        name: "nord",
        label: "Nord",
        activeColor: "oklch(0.55 0.15 220)",
        previewColors: ["oklch(0.55 0.15 220)", "oklch(0.55 0.15 180)", "oklch(0.15 0.02 220)", "oklch(0.98 0.002 220)"],
        cssVars: {
            light: { "--brand-hue": "220", "--accent-hue": "180", "--neutral-hue": "220" }, // Nord keeps its specific blue-grey
            dark: { "--brand-hue": "220", "--accent-hue": "180", "--neutral-hue": "220" },
        },
    },
    {
        name: "solarized",
        label: "Solarized",
        activeColor: "oklch(0.55 0.15 195)",
        previewColors: ["oklch(0.55 0.15 195)", "oklch(0.55 0.15 45)", "oklch(0.15 0.02 195)", "oklch(0.98 0.002 195)"],
        cssVars: {
            light: { "--brand-hue": "195", "--accent-hue": "45", "--neutral-hue": "195" }, // Solarized keeps its specific hue
            dark: { "--brand-hue": "195", "--accent-hue": "45", "--neutral-hue": "195" },
        },
    },
    {
        name: "synthwave",
        label: "Synthwave",
        activeColor: "oklch(0.55 0.25 290)",
        previewColors: ["oklch(0.55 0.25 290)", "oklch(0.55 0.25 180)", "oklch(0.15 0.02 260)", "oklch(0.98 0.002 260)"],
        cssVars: {
            light: { "--brand-hue": "290", "--accent-hue": "180", "--neutral-hue": "260" }, // Deep Purple/Blue
            dark: { "--brand-hue": "290", "--accent-hue": "180", "--neutral-hue": "260" },
        },
    },
    {
        name: "forest",
        label: "Forest",
        activeColor: "oklch(0.55 0.20 140)",
        previewColors: ["oklch(0.55 0.20 140)", "oklch(0.55 0.20 40)", "oklch(0.15 0.02 60)", "oklch(0.98 0.002 60)"],
        cssVars: {
            light: { "--brand-hue": "140", "--accent-hue": "40", "--neutral-hue": "60" }, // Stone/Earth
            dark: { "--brand-hue": "140", "--accent-hue": "40", "--neutral-hue": "60" },
        },
    },
    {
        name: "ocean",
        label: "Ocean",
        activeColor: "oklch(0.55 0.20 230)",
        previewColors: ["oklch(0.55 0.20 230)", "oklch(0.55 0.20 190)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "230", "--accent-hue": "190", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "230", "--accent-hue": "190", "--neutral-hue": "240" },
        },
    },
    {
        name: "sunset",
        label: "Sunset",
        activeColor: "oklch(0.55 0.25 25)",
        previewColors: ["oklch(0.55 0.25 25)", "oklch(0.55 0.25 280)", "oklch(0.15 0.02 30)", "oklch(0.98 0.002 30)"],
        cssVars: {
            light: { "--brand-hue": "25", "--accent-hue": "280", "--neutral-hue": "30" }, // Warm Grey
            dark: { "--brand-hue": "25", "--accent-hue": "280", "--neutral-hue": "30" },
        },
    },
    {
        name: "berry",
        label: "Berry",
        activeColor: "oklch(0.55 0.25 340)",
        previewColors: ["oklch(0.55 0.25 340)", "oklch(0.55 0.25 260)", "oklch(0.15 0.02 240)", "oklch(0.98 0.002 240)"],
        cssVars: {
            light: { "--brand-hue": "340", "--accent-hue": "260", "--neutral-hue": "240" }, // Zinc
            dark: { "--brand-hue": "340", "--accent-hue": "260", "--neutral-hue": "240" },
        },
    },
    {
        name: "midnight",
        label: "Midnight",
        activeColor: "oklch(0.40 0.20 270)",
        previewColors: ["oklch(0.40 0.20 270)", "oklch(0.55 0.20 220)", "oklch(0.15 0.02 250)", "oklch(0.98 0.002 250)"],
        cssVars: {
            light: { "--brand-hue": "270", "--accent-hue": "220", "--neutral-hue": "250" }, // Slate
            dark: { "--brand-hue": "270", "--accent-hue": "220", "--neutral-hue": "250" },
        },
    },
]
