'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { assignWarehouseToUser, removeWarehouseFromUser } from '@/app/actions/user-warehouses'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Warehouse {
    id: number
    name: string
}

interface UserWarehouseFormProps {
    userId: number
    assignedWarehouses: Warehouse[]
    availableWarehouses: Warehouse[]
}

export function UserWarehouseForm({ userId, assignedWarehouses, availableWarehouses }: UserWarehouseFormProps) {
    const [loading, setLoading] = useState(false)

    async function handleAssign(warehouseId: string) {
        setLoading(true)
        try {
            const result = await assignWarehouseToUser({
                userId,
                warehouseId: parseInt(warehouseId),
            })

            if (result.success) {
                toast.success('Warehouse assigned')
            } else {
                toast.error(result.error || 'Failed to assign warehouse')
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleRemove(warehouseId: number) {
        if (!confirm('Are you sure you want to remove this warehouse assignment?')) return

        setLoading(true)
        try {
            const result = await removeWarehouseFromUser({
                userId,
                warehouseId,
            })

            if (result.success) {
                toast.success('Warehouse removed')
            } else {
                toast.error(result.error || 'Failed to remove warehouse')
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Filter out already assigned warehouses
    const unassignedWarehouses = availableWarehouses.filter(
        (w) => !assignedWarehouses.some((aw) => aw.id === w.id)
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {assignedWarehouses.length === 0 && (
                    <p className="text-sm text-muted-foreground">No warehouses assigned.</p>
                )}
                {assignedWarehouses.map((warehouse) => (
                    <Badge key={warehouse.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {warehouse.name}
                        <button
                            onClick={() => handleRemove(warehouse.id)}
                            disabled={loading}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="flex gap-2">
                <Select onValueChange={handleAssign} disabled={loading || unassignedWarehouses.length === 0}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign warehouse..." />
                    </SelectTrigger>
                    <SelectContent>
                        {unassignedWarehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
