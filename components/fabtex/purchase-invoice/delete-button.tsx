'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deletePurchaseInvoice } from '@/app/actions/fabtex/purchase-invoice'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteInvoiceButtonProps {
    id: string
    invoiceNumber: string
}

export function DeleteInvoiceButton({ id, invoiceNumber }: DeleteInvoiceButtonProps) {
    const [loading, setLoading] = useState(false)

    const onDelete = async () => {
        setLoading(true)
        try {
            const result = await deletePurchaseInvoice(id)
            if (result.success) {
                toast.success('Invoice deleted successfully')
            } else {
                toast.error(result.error || 'Failed to delete invoice')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="group-hover:opacity-100 opacity-0 transition-opacity rounded-full shadow-sm bg-background border border-destructive/10 hover:bg-destructive/5 hover:border-destructive/30">
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete invoice <strong>{invoiceNumber}</strong>.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
