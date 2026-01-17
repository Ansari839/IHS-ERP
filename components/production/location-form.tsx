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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, FileText, Activity, Settings } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional().or(z.literal("")),
    status: z.string().min(1, "Status is required"),
})

interface LocationFormProps {
    location?: {
        id: number
        name: string
        description: string | null
        status: string
    }
    onSuccess?: () => void
}

export function LocationForm({ location, onSuccess }: LocationFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: location?.name || "",
            description: location?.description || "",
            status: (location?.status as any) || "ACTIVE",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = location
                ? `/api/production/locations/${location.id}`
                : "/api/production/locations"
            const method = location ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            toast.success(location ? "Location updated successfully" : "Location created successfully")
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
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Location Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    placeholder="e.g. Floor 1, Dept A"
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Activity className="w-4 h-4 text-primary" />
                                            Status
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                                        Active
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="INACTIVE">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                                        Inactive
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Optional description of the location..."
                                            className="resize-none bg-background/50 border-primary/20 focus:border-primary min-h-[100px] transition-all duration-300 hover:bg-background/80"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        {location ? "Update Location" : "Create Location"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
