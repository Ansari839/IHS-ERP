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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
})

interface CategoryFormProps {
    category?: {
        id: number
        name: string
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Category name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional description"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
