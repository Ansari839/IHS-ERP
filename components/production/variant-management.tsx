"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Variant } from "@/app/generated/prisma"
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
import { VariantForm } from "./variant-form"
import { DeleteVariantButton } from "./delete-variant-button"
import { format } from "date-fns"
import { Plus, Pencil, Layers } from "lucide-react"

interface VariantManagementProps {
    initialVariants: any[] // Using any[] for now to avoid complex Prisma relation types in this component
}

export function VariantManagement({ initialVariants }: VariantManagementProps) {
    const router = useRouter()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editVariant, setEditVariant] = useState<any | null>(null)

    const handleSuccess = () => {
        setIsAddOpen(false)
        setEditVariant(null)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Specifications</h1>
                    <p className="text-muted-foreground">Manage technical specifications and lots for Yarn and Fabrics.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Specification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Technical Specification</DialogTitle>
                        </DialogHeader>
                        <VariantForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lot/Batch</TableHead>
                            <TableHead>Spec Name</TableHead>
                            <TableHead>Parent Product</TableHead>
                            <TableHead>Color/Attributes</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialVariants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No specifications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialVariants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-mono font-bold text-primary">{variant.sku}</TableCell>
                                    <TableCell className="font-medium">{variant.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{variant.product.name}</span>
                                            <span className="text-xs text-muted-foreground uppercase">{variant.product.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {variant.color && <span className="bg-accent px-1.5 py-0.5 rounded text-[10px]">{variant.color}</span>}
                                            {variant.count && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">{variant.count}</span>}
                                            {variant.gsm && <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">{variant.gsm} GSM</span>}
                                            {variant.width && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{variant.width}"</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(variant.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog
                                                open={editVariant?.id === variant.id}
                                                onOpenChange={(open) => !open && setEditVariant(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditVariant(variant)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Specification</DialogTitle>
                                                    </DialogHeader>
                                                    <VariantForm
                                                        variant={variant}
                                                        onSuccess={handleSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteVariantButton id={variant.id} name={variant.name} />
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
