"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Sun, Moon, Timer, Settings } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
})

interface ShiftFormProps {
    shift?: {
        id: number
        name: string
        startTime: string
        endTime: string
    }
    onSuccess?: () => void
}

export function ShiftForm({ shift, onSuccess }: ShiftFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: shift?.name || "",
            startTime: shift?.startTime || "",
            endTime: shift?.endTime || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = shift
                ? `/api/production/in-house/shifts/${shift.id}`
                : "/api/production/in-house/shifts"
            const method = shift ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            toast.success(shift ? "Shift updated successfully" : "Shift created successfully")
            router.refresh()
            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
                <Card className="bg-card/40 backdrop-blur-sm border-primary/10 shadow-lg">
                    <CardContent className="pt-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                        <Sun className="w-4 h-4 text-primary" />
                                        Shift Name
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Sun className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="e.g. Morning Shift"
                                                className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Clock className="w-4 h-4 text-primary" />
                                            Start Time
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    type="time"
                                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Timer className="w-4 h-4 text-primary" />
                                            End Time
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Timer className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    type="time"
                                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                        {isLoading && <Settings className="mr-2 h-4 w-4 animate-spin" />}
                        {shift ? "Update Shift" : "Create Shift"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
