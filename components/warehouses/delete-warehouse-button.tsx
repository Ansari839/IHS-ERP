'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteWarehouse } from '@/app/actions/warehouses'
import { toast } from 'sonner'

interface DeleteWarehouseButtonProps {
    id: number
}

export function DeleteWarehouseButton({ id }: DeleteWarehouseButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this warehouse?')) return

        setLoading(true)
        try {
            const result = await deleteWarehouse(id)
            if (result.success) {
                toast.success('Warehouse deleted')
            } else {
                toast.error(result.error || 'Failed to delete warehouse')
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={handleDelete}
            disabled={loading}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
