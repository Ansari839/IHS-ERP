export type ThemeColor = {
    name: string
    label: string
    activeColor: string
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
    {
        name: "blue",
        label: "Default (Blue)",
        activeColor: "oklch(0.55 0.25 260)",
        cssVars: {
            light: {
                "--brand-hue": "260",
                "--accent-hue": "326.541",
                "--neutral-hue": "260",
            },
            dark: {
                "--brand-hue": "260",
                "--accent-hue": "180",
                "--neutral-hue": "260",
            },
        },
    },
    {
        name: "emerald",
        label: "Emerald",
        activeColor: "oklch(0.55 0.25 150)",
        cssVars: {
            light: {
                "--brand-hue": "150",
                "--accent-hue": "30",
                "--neutral-hue": "150",
            },
            dark: {
                "--brand-hue": "150",
                "--accent-hue": "30",
                "--neutral-hue": "150",
            },
        },
    },
    {
        name: "violet",
        label: "Violet",
        activeColor: "oklch(0.55 0.25 280)",
        cssVars: {
            light: {
                "--brand-hue": "280",
                "--accent-hue": "320",
                "--neutral-hue": "280",
            },
            dark: {
                "--brand-hue": "280",
                "--accent-hue": "320",
                "--neutral-hue": "280",
            },
        },
    },
    {
        name: "amber",
        label: "Amber",
        activeColor: "oklch(0.55 0.25 40)",
        cssVars: {
            light: {
                "--brand-hue": "40",
                "--accent-hue": "0",
                "--neutral-hue": "40",
            },
            dark: {
                "--brand-hue": "40",
                "--accent-hue": "0",
                "--neutral-hue": "40",
            },
        },
    },
    {
        name: "rose",
        label: "Rose",
        activeColor: "oklch(0.55 0.25 10)",
        cssVars: {
            light: {
                "--brand-hue": "10",
                "--accent-hue": "280",
                "--neutral-hue": "10",
            },
            dark: {
                "--brand-hue": "10",
                "--accent-hue": "280",
                "--neutral-hue": "10",
            },
        },
    },
    {
        name: "slate",
        label: "Slate",
        activeColor: "oklch(0.55 0.05 260)",
        cssVars: {
            light: {
                "--brand-hue": "220", // More of a steel blue/grey
                "--accent-hue": "260",
                "--neutral-hue": "260",
            },
            dark: {
                "--brand-hue": "220",
                "--accent-hue": "260",
                "--neutral-hue": "260",
            },
        },
    },
]
