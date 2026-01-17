"use client"

import { useState, useEffect } from "react"
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
import { Package, Barcode, Layers, Ruler, Tags, FileText } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    code: z.string().min(2, {
        message: "Code must be at least 2 characters.",
    }),
    description: z.string().optional(),
    type: z.enum(["YARN", "FABRIC", "PACKING_MATERIAL"]),
    categoryId: z.string().min(1, { message: "Category is required" }),
    unitId: z.string().min(1, { message: "Unit is required" }),
})

interface ProductFormProps {
    product?: any
    onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            code: product?.code || "",
            description: product?.description || "",
            type: product?.type || "YARN",
            categoryId: product?.categoryId?.toString() || "",
            unitId: product?.unitId?.toString() || "",
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, unitsRes] = await Promise.all([
                    fetch("/api/production/categories"),
                    fetch("/api/production/units")
                ])
                const cats = await catsRes.json()
                const unitsData = await unitsRes.json()
                setCategories(cats)
                setUnits(unitsData)
            } catch (error) {
                console.error("Error fetching dependencies:", error)
            }
        }
        fetchData()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = product
                ? `/api/production/products/${product.id}`
                : "/api/production/products"
            const method = product ? "PUT" : "POST"

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

            toast.success(product ? "Product updated" : "Product created")
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* --- Basic Information --- */}
                <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Package className="w-4 h-4" /> Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="Product name" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
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
                                            <Barcode className="w-4 h-4" /> Code / SKU
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="PRD-001" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Tags className="w-4 h-4" /> Type
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative">
                                                    <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <Tags className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="YARN">YARN</SelectItem>
                                                <SelectItem value="FABRIC">FABRIC</SelectItem>
                                                <SelectItem value="PACKING_MATERIAL">PACKING MATERIAL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Layers className="w-4 h-4" /> Category
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative">
                                                    <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Ruler className="w-4 h-4" /> Unit
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative">
                                                    <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.name} ({unit.symbol})
                                                    </SelectItem>
                                                ))}
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
                        {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
