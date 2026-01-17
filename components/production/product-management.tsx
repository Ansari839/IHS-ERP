"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/app/generated/prisma"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { DeleteProductButton } from "./delete-product-button"
import { format } from "date-fns"
import { Plus, Pencil } from "lucide-react"

interface ProductManagementProps {
    initialProducts: (Product & { category: { name: string }, unit: { name: string } })[]
}

export function ProductManagement({ initialProducts }: ProductManagementProps) {
    const router = useRouter()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null)

    const handleSuccess = () => {
        setIsAddOpen(false)
        setEditProduct(null)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage Yarn, Fabrics, and Packing Materials.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <ProductForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Specs</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-mono">{product.code}</TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.type}</TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>{product.unit.name}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {(product as any)._count?.variants || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(product.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog
                                                open={editProduct?.id === product.id}
                                                onOpenChange={(open) => !open && setEditProduct(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditProduct(product)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Product</DialogTitle>
                                                    </DialogHeader>
                                                    <ProductForm
                                                        product={product}
                                                        onSuccess={handleSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteProductButton id={product.id} name={product.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
