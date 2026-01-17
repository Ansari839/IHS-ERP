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
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Layers, Barcode, FileText } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    code: z.string().min(1, {
        message: "Code is required.",
    }),
    description: z.string().optional(),
})

interface CategoryFormProps {
    category?: {
        id: number
        name: string
        code: string
        description: string | null
    }
    onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category?.name || "",
            code: category?.code || "",
            description: category?.description || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = category
                ? `/api/production/categories/${category.id}`
                : "/api/production/categories"
            const method = category ? "PUT" : "POST"

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

            toast.success(category ? "Category updated" : "Category created")
            router.refresh()
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
                <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Layers className="w-4 h-4" /> Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="Category name" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Barcode className="w-4 h-4" /> Code
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="CAT-001" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </FormControl>
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
                                    <FormLabel className="flex items-center gap-2 text-primary">
                                        <FileText className="w-4 h-4" /> Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Optional description"
                                            className="resize-none bg-background/50 border-primary/20 focus:border-primary"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading} className="min-w-[150px] shadow-lg shadow-primary/20">
                        {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
