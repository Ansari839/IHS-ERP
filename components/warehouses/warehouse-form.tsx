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
import { Plus, Trash2 } from 'lucide-react'

interface WarehouseFormProps {
    warehouse?: {
        id: number
        name: string
        location: string | null
        contactPerson: string | null
        contactNumbers: string[]
        status: string
    }
    onSuccess?: () => void
}

export function WarehouseForm({ warehouse, onSuccess }: WarehouseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for dynamic contact numbers
    const [contactNumbers, setContactNumbers] = useState<string[]>(
        warehouse?.contactNumbers && warehouse.contactNumbers.length > 0
            ? warehouse.contactNumbers
            : ['']
    )

    const addContactNumber = () => {
        setContactNumbers([...contactNumbers, ''])
    }

    const removeContactNumber = (index: number) => {
        const newNumbers = contactNumbers.filter((_, i) => i !== index)
        setContactNumbers(newNumbers.length > 0 ? newNumbers : [''])
    }

    const handleContactNumberChange = (index: number, value: string) => {
        const newNumbers = [...contactNumbers]
        newNumbers[index] = value
        setContactNumbers(newNumbers)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        try {
            // Filter empty numbers
            const filteredNumbers = contactNumbers.filter(num => num.trim() !== '')

            let result
            if (warehouse) {
                result = await updateWarehouse({
                    id: warehouse.id,
                    name: formData.get('name') as string,
                    location: formData.get('location') as string,
                    contactPerson: formData.get('contactPerson') as string,
                    contactNumbers: filteredNumbers,
                    status: formData.get('status') as string,
                })
            } else {
                // For create, we append to formData or pass special handling in action
                // Since our action expects JSON string for arrays in FormData:
                formData.set('contactNumbers', JSON.stringify(filteredNumbers))
                result = await createWarehouse(formData)
            }

            if (result.success) {
                toast.success(warehouse ? 'Warehouse updated' : 'Warehouse created')
                router.refresh()
                if (onSuccess) {
                    onSuccess()
                } else {
                    // Default behavior if no onSuccess provided (e.g. on a page)
                    router.push('/dashboard/inventory/warehouses')
                }
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
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                    id="contactPerson"
                    name="contactPerson"
                    defaultValue={warehouse?.contactPerson || ''}
                    placeholder="e.g. John Doe"
                />
            </div>

            <div className="space-y-2">
                <Label>Contact Numbers</Label>
                {contactNumbers.map((number, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            value={number}
                            onChange={(e) => handleContactNumberChange(index, e.target.value)}
                            placeholder="e.g. +1 234 567 890"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeContactNumber(index)}
                            disabled={contactNumbers.length === 1 && contactNumbers[0] === ''}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addContactNumber}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Number
                </Button>
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
