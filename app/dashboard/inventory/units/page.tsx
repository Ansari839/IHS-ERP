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
import { UnitForm } from '@/components/inventory/unit-form'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2 } from 'lucide-react' // Import icons
import { deleteUnit } from '@/app/actions/inventory'
import { DeleteUnitButton } from '@/components/inventory/delete-unit-button'

export const dynamic = 'force-dynamic'

export default async function UnitsPage() {
    const units = await prisma.unit.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Unit</DialogTitle>
                        </DialogHeader>
                        <UnitForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Base Unit</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No units found. Create one above.
                                </TableCell>
                            </TableRow>
                        ) : (
                            units.map((unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-medium">{unit.name}</TableCell>
                                    <TableCell>{unit.symbol}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{unit.unitType}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {unit.isBase ? (
                                            <Badge variant="default">Yes</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(unit.updatedAt), 'MMM d, yyyy')}
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
                                                        <DialogTitle>Edit Unit</DialogTitle>
                                                    </DialogHeader>
                                                    <UnitForm unit={unit} />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteUnitButton id={unit.id} name={unit.name} />
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
