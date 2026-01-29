'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DeliveryOrder } from '@/app/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { deleteDeliveryOrder } from '@/app/actions/fabtex/delivery-order'
import { toast } from 'sonner'
import Link from 'next/link'

export const columns: ColumnDef<DeliveryOrder & { salesOrder: any, items: any[] }>[] = [
    {
        accessorKey: 'doNumber',
        header: 'DO Number',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.date), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'salesOrder.soNumber',
        header: 'SO Link',
        cell: ({ row }) => row.original.salesOrder?.soNumber || '-',
    },
    {
        accessorKey: 'party',
        header: 'Customer',
        cell: ({ row }) => row.original.salesOrder?.account?.name || row.original.salesOrder?.partyName || '-',
    },
    {
        accessorKey: 'gatePassNo',
        header: 'Gate Pass',
        cell: ({ row }) => row.original.gatePassNo || '-',
    },
    {
        accessorKey: 'vehicleNo',
        header: 'Vehicle',
        cell: ({ row }) => row.original.vehicleNo || '-',
    },
    {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => row.original.items?.length || 0,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const doItem = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this Delivery Order?')) {
                    const result = await deleteDeliveryOrder(doItem.id)
                    if (result.success) {
                        toast.success('DO deleted successfully')
                    } else {
                        toast.error(result.error)
                    }
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/fab-tex/sales/delivery-order/${doItem.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Link>
                        </DropdownMenuItem>
                        {/* Edit is usually harder for GRN/DO due to stock impact, but we can allow it if implemented */}
                        {/* For now, maybe just View and Delete? Or Edit too. I implemented updateDeliveryOrder. */}
                        {/* Let's add Edit link if I make the page. */}
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/fab-tex/sales/delivery-order/${doItem.id}/edit`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
