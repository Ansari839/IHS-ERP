import { Suspense } from 'react'
import prisma from '@/lib/prisma'
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

export const dynamic = 'force-dynamic'

export default async function WarehousesPage() {
    const warehouses = await prisma.warehouse.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                <Dialog>
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
                        <WarehouseForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No warehouses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            warehouses.map((warehouse) => (
                                <TableRow key={warehouse.id}>
                                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                                    <TableCell>{warehouse.location || '-'}</TableCell>
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
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Warehouse</DialogTitle>
                                                    </DialogHeader>
                                                    <WarehouseForm warehouse={warehouse} />
                                                </DialogContent>
                                            </Dialog>

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
