'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createWarehouse, updateWarehouse } from '@/app/actions/warehouses'
import { toast } from 'sonner'

interface WarehouseFormProps {
    warehouse?: {
        id: number
        name: string
        location: string | null
        status: string
    }
    onSuccess?: () => void
}

export function WarehouseForm({ warehouse, onSuccess }: WarehouseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        try {
            let result
            if (warehouse) {
                result = await updateWarehouse({
                    id: warehouse.id,
                    name: formData.get('name') as string,
                    location: formData.get('location') as string,
                    status: formData.get('status') as string,
                })
            } else {
                result = await createWarehouse(formData)
            }

            if (result.success) {
                toast.success(warehouse ? 'Warehouse updated' : 'Warehouse created')
                router.refresh()
                if (onSuccess) onSuccess()
            } else {
                setError(result.error || 'Operation failed')
            }
        } catch (e) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={warehouse?.name}
                    required
                    placeholder="e.g. Main Warehouse"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    name="location"
                    defaultValue={warehouse?.location || ''}
                    placeholder="e.g. New York, NY"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={warehouse?.status || 'ACTIVE'}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
        </form>
    )
}
