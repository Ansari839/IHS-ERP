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
import { ConversionForm } from '@/components/inventory/conversion-form'
import { format } from 'date-fns'
import { Plus, Pencil, ArrowRight } from 'lucide-react'
import { DeleteConversionButton } from '@/components/inventory/delete-conversion-button'

export const dynamic = 'force-dynamic'

export default async function ConversionsPage() {
    const conversions = await prisma.unitConversion.findMany({
        include: {
            fromUnit: true,
            toUnit: true
        },
        orderBy: { createdAt: 'desc' },
    })

    const units = await prisma.unit.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Unit Conversions</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Conversion
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Conversion</DialogTitle>
                        </DialogHeader>
                        <ConversionForm units={units} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>From Unit</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>To Unit</TableHead>
                            <TableHead>Equation</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {conversions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No conversions found. Create one above.
                                </TableCell>
                            </TableRow>
                        ) : (
                            conversions.map((conversion) => (
                                <TableRow key={conversion.id}>
                                    <TableCell className="font-medium">
                                        {conversion.fromUnit.name} ({conversion.fromUnit.symbol})
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono">{conversion.conversionRate}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {conversion.toUnit.name} ({conversion.toUnit.symbol})
                                    </TableCell>
                                    <TableCell className="text-muted-foreground italic">
                                        1 {conversion.fromUnit.symbol} = {conversion.conversionRate} {conversion.toUnit.symbol}
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
                                                        <DialogTitle>Edit Conversion</DialogTitle>
                                                    </DialogHeader>
                                                    <ConversionForm conversion={conversion} units={units} />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteConversionButton id={conversion.id} />
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
