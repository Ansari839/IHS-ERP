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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    sku: z.string().min(2, { message: "Lot/Batch number must be at least 2 characters." }),
    productId: z.string().min(1, { message: "Product is required" }),
    // Textile Fields
    color: z.string().optional(),
    count: z.string().optional(),
    gsm: z.string().optional(),
    width: z.string().optional(),
    shade: z.string().optional(),
    weave: z.string().optional(),
    finish: z.string().optional(),
    type: z.string().optional(),
})

interface VariantFormProps {
    variant?: any
    onSuccess?: () => void
}

export function VariantForm({ variant, onSuccess }: VariantFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: variant?.name || "",
            sku: variant?.sku || "",
            productId: variant?.productId?.toString() || "",
            color: variant?.color || "",
            count: variant?.count || "",
            gsm: variant?.gsm || "",
            width: variant?.width || "",
            shade: variant?.shade || "",
            weave: variant?.weave || "",
            finish: variant?.finish || "",
            type: variant?.type || "",
        },
    })

    const productId = form.watch("productId")

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/production/products")
                const data = await res.json()
                setProducts(data)

                if (variant?.productId) {
                    const prod = data.find((p: any) => p.id === variant.productId)
                    setSelectedProduct(prod)
                }
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [variant])

    useEffect(() => {
        if (productId && products.length > 0) {
            const prod = products.find(p => p.id.toString() === productId)
            setSelectedProduct(prod)
        }
    }, [productId, products])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = variant
                ? `/api/production/variants/${variant.id}`
                : "/api/production/variants"
            const method = variant ? "PUT" : "POST"

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

            toast.success(variant ? "Specification updated" : "Specification created")
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
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Product</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent product" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.name} ({product.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Spec Name / Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 20s Carded Raw" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lot / Batch Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="LOT-12345" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Dynamic Fields based on Type */}
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color / Shade</FormLabel>
                                <FormControl>
                                    <Input placeholder="Raw / White / Blue" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {selectedProduct?.type === "YARN" && (
                        <>
                            <FormField
                                control={form.control}
                                name="count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yarn Count</FormLabel>
                                        <FormControl>
                                            <Input placeholder="20s, 30s, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yarn Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Carded / Combed" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {selectedProduct?.type === "FABRIC" && (
                        <>
                            <FormField
                                control={form.control}
                                name="gsm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GSM</FormLabel>
                                        <FormControl>
                                            <Input placeholder="120, 140, 180" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="width"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Width</FormLabel>
                                        <FormControl>
                                            <Input placeholder='58", 60", etc.' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="weave"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weave</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Plain / Twill" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="finish"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Finish</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Grey / Finished" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading ? "Saving..." : variant ? "Update Specification" : "Create Specification"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
