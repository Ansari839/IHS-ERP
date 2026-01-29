'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SalesInvoice } from '@/app/generated/prisma/client'
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
import { deleteSalesInvoice } from '@/app/actions/fabtex/sales-invoice'
import { toast } from 'sonner'
import Link from 'next/link'

export const columns: ColumnDef<SalesInvoice & { salesOrder: any, account: any }>[] = [
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice No',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.date), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'salesOrder.soNumber',
        header: 'SO Ref',
        cell: ({ row }) => row.original.salesOrder?.soNumber || '-',
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => row.original.account?.name || (row.original.salesOrder?.account?.name) || '-',
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(row.original.totalAmount),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                {row.original.status}
            </div>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const invoice = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this Invoice?')) {
                    const result = await deleteSalesInvoice(invoice.id)
                    if (result.success) {
                        toast.success('Invoice deleted successfully')
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
                            <Link href={`/dashboard/fab-tex/sales/invoice/${invoice.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/fab-tex/sales/invoice/${invoice.id}/edit`}>
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
