'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { WarehouseForm } from '@/components/warehouses/warehouse-form'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Plus, Pencil } from 'lucide-react'
import { DeleteWarehouseButton } from '@/components/warehouses/delete-warehouse-button'
// import { Warehouse } from '@prisma/client'

interface WarehouseListClientProps {
    initialData: any[] // Using any to bypass exact Prisma type matching issues usually found in Client components
    segment?: string
}

export function WarehouseListClient({ initialData, segment = 'GENERAL' }: WarehouseListClientProps) {
    const [createOpen, setCreateOpen] = useState(false)
    // We can also track edit state per item if needed, but for simplicity relying on individual Dialog triggers

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                        </DialogHeader>
                        <WarehouseForm onSuccess={() => setCreateOpen(false)} segment={segment} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Contact Numbers</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No warehouses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.map((warehouse) => (
                                <TableRow key={warehouse.id}>
                                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                                    <TableCell>{warehouse.location || '-'}</TableCell>
                                    <TableCell>{warehouse.contactPerson || '-'}</TableCell>
                                    <TableCell>
                                        {warehouse.contactNumbers && warehouse.contactNumbers.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {warehouse.contactNumbers.map((num: string, idx: number) => (
                                                    <span key={idx} className="text-xs bg-muted px-2 py-1 rounded inline-block w-fit">
                                                        {num}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={warehouse.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {warehouse.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(warehouse.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Edit Dialog - Self Managed State */}
                                            <EditWarehouseDialog warehouse={warehouse} segment={segment} />
                                            <DeleteWarehouseButton id={warehouse.id} />
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

function EditWarehouseDialog({ warehouse, segment }: { warehouse: any, segment: string }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Warehouse</DialogTitle>
                </DialogHeader>
                <WarehouseForm warehouse={warehouse} onSuccess={() => setOpen(false)} segment={segment} />
            </DialogContent>
        </Dialog>
    )
}
