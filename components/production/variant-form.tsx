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
import { Card, CardContent } from "@/components/ui/card"
import { Package2, GitBranch, Barcode, Palette, Hash, Tags, Layers, Maximize, Grid3X3, Gem, Settings2 } from "lucide-react"

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">

                {/* --- Parent Product & Basics --- */}
                <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary">
                                        <Package2 className="w-4 h-4" /> Parent Product
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <div className="relative">
                                                <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                    <SelectValue placeholder="Select parent product" />
                                                </SelectTrigger>
                                                <Package2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <GitBranch className="w-4 h-4" /> Spec Name / Description
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="e.g. 20s Carded Raw" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
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
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Barcode className="w-4 h-4" /> Lot / Batch Number
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="LOT-12345" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                                <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- Dynamic Specs --- */}
                {(productId || selectedProduct) && (
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <Settings2 className="w-5 h-5" /> Technical Specifications
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                <Palette className="w-4 h-4" /> Color / Shade
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="Raw / White / Blue" {...field} className="pl-9 bg-background/50" />
                                                    <Palette className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Hash className="w-4 h-4" /> Yarn Count
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder="20s, 30s, etc." {...field} className="pl-9 bg-background/50" />
                                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Tags className="w-4 h-4" /> Yarn Type
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder="Carded / Combed" {...field} className="pl-9 bg-background/50" />
                                                            <Tags className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Layers className="w-4 h-4" /> GSM
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder="120, 140, 180" {...field} className="pl-9 bg-background/50" />
                                                            <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Maximize className="w-4 h-4" /> Width
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder='58", 60", etc.' {...field} className="pl-9 bg-background/50" />
                                                            <Maximize className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Grid3X3 className="w-4 h-4" /> Weave
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder="Plain / Twill" {...field} className="pl-9 bg-background/50" />
                                                            <Grid3X3 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                                        <Gem className="w-4 h-4" /> Finish
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input placeholder="Grey / Finished" {...field} className="pl-9 bg-background/50" />
                                                            <Gem className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading} className="min-w-[150px] shadow-lg shadow-primary/20">
                        {isLoading ? "Saving..." : variant ? "Update Specification" : "Create Specification"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
