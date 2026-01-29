'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SalesReturn } from '@/app/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Eye, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { deleteSalesReturn } from '@/app/actions/fabtex/sales-return'
import { toast } from 'sonner'
import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'

export const columns: ColumnDef<SalesReturn & { salesInvoice: any, account: any }>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.date), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'returnNumber',
        header: 'Return #',
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => row.original.account?.name || (row.original.salesInvoice?.account?.name) || '-',
    },
    {
        accessorKey: 'salesInvoice.invoiceNumber',
        header: 'Ref Invoice',
        cell: ({ row }) => row.original.salesInvoice?.invoiceNumber || 'Direct',
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(row.original.totalAmount),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const ret = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this Return?')) {
                    const result = await deleteSalesReturn(ret.id)
                    if (result.success) {
                        toast.success('Return deleted successfully')
                    } else {
                        toast.error(result.error || 'Failed to delete')
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
                            <Link href={`/dashboard/fab-tex/sales/sales-return/${ret.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
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
