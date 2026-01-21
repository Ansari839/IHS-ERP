'use client'

import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OrderProgressProps {
    label: string
    current: number
    total: number
    color?: string
}

export function OrderProgress({ label, current, total, color = "bg-primary" }: OrderProgressProps) {
    const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0

    return (
        <div className="space-y-1 w-full max-w-[120px]">
            <div className="flex justify-between text-[10px] font-medium uppercase text-muted-foreground">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{current} / {total} units {label.toLowerCase()}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
