"use client"

import { useTheme } from "@/components/theme-provider"
import { THEME_COLORS } from "@/lib/themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Moon, Sun, Laptop } from "lucide-react"

export function ThemeSettings() {
    const { theme, setTheme, themeColor, setThemeColor } = useTheme()

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Label>Theme Mode</Label>
                            <RadioGroup
                                defaultValue={theme}
                                onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                                className="grid max-w-md grid-cols-3 gap-8 pt-2"
                            >
                                <div>
                                    <Label className="[&:has([data-state=checked])>div]:border-primary">
                                        <RadioGroupItem value="light" className="sr-only" />
                                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2">
                                            <Sun className="h-4 w-4" />
                                            <span className="block w-full text-center font-normal">Light</span>
                                        </div>
                                    </Label>
                                </div>
                                <div>
                                    <Label className="[&:has([data-state=checked])>div]:border-primary">
                                        <RadioGroupItem value="dark" className="sr-only" />
                                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2">
                                            <Moon className="h-4 w-4" />
                                            <span className="block w-full text-center font-normal">Dark</span>
                                        </div>
                                    </Label>
                                </div>
                                <div>
                                    <Label className="[&:has([data-state=checked])>div]:border-primary">
                                        <RadioGroupItem value="system" className="sr-only" />
                                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2">
                                            <Laptop className="h-4 w-4" />
                                            <span className="block w-full text-center font-normal">System</span>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <Label>Theme Color</Label>
                            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                                {THEME_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setThemeColor(color.name)}
                                        className={`
                                            group flex flex-col items-center gap-2 rounded-lg border-2 p-2 hover:bg-accent
                                            ${themeColor === color.name ? "border-primary bg-accent" : "border-transparent"}
                                        `}
                                    >
                                        <div
                                            className="h-10 w-10 rounded-full border shadow-sm"
                                            style={{ backgroundColor: color.activeColor }}
                                        />
                                        <span className="text-xs font-medium">{color.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
