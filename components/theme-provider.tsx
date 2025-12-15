"use client"

import * as React from "react"
import { THEME_COLORS, type ThemeColor } from "@/lib/themes"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    defaultColor?: string
    storageKey?: string
    colorStorageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    themeColor: string
    setThemeColor: (color: string) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    themeColor: "blue",
    setThemeColor: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultColor = "blue",
    storageKey = "erp-ui-theme",
    colorStorageKey = "erp-ui-theme-color",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = React.useState<Theme>(
        () => (typeof window !== "undefined" && localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    const [themeColor, setThemeColor] = React.useState<string>(
        () => (typeof window !== "undefined" && localStorage.getItem(colorStorageKey)) || defaultColor
    )

    // Handle Theme (Light/Dark)
    React.useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    // Handle Theme Color
    React.useEffect(() => {
        const root = window.document.documentElement
        const selectedPalette = THEME_COLORS.find(c => c.name === themeColor) || THEME_COLORS[0]

        // Determine if we are effectively in dark mode for hue selection
        // This is a bit tricky because 'system' relies on media query.
        // For simplicity, we'll assume the hues are mostly consistent or we apply the 'light' hues by default
        // and if we strictly needed different hues for dark mode that depend on the class,
        // we might need to use CSS variables for the hues themselves inside the .dark block in CSS.
        // BUT, since we are setting style properties on root, we can just set them.

        // To properly support different hues for light/dark, we should check the class list or media query again.
        // However, to avoid complexity and flickering, let's check the resolved theme.

        const isDark = root.classList.contains("dark") ||
            (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

        const cssVars = isDark ? selectedPalette.cssVars.dark : selectedPalette.cssVars.light

        Object.entries(cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value)
        })

    }, [themeColor, theme]) // Re-run if theme changes (to potentially switch hues)

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        themeColor,
        setThemeColor: (color: string) => {
            localStorage.setItem(colorStorageKey, color)
            setThemeColor(color)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
