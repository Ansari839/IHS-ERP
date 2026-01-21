'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PurchaseOrder, PurchaseOrderType, PurchaseOrderStatus } from '@/app/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deletePurchaseOrder } from '@/app/actions/fabtex/purchase-order'
import { toast } from 'sonner'
import Link from 'next/link'
import { OrderProgress } from './order-progress'

export const columns: ColumnDef<PurchaseOrder & { account: any, warehouse: any, items: any[] }>[] = [
    {
        accessorKey: 'poNumber',
        header: 'PO Number',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.date), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'party',
        header: 'Party',
        cell: ({ row }) => {
            return row.original.account?.name || row.original.partyName || '-'
        }
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.type}</Badge>
        ),
    },
    {
        accessorKey: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => row.original.warehouse?.name || '-',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.status === 'APPROVED' ? 'default' : 'secondary'}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) =>
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(row.original.totalAmount),
    },
    {
        id: 'fulfillment',
        header: 'Fulfillment',
        cell: ({ row }) => {
            const items = row.original.items || []

            const totalOrdered = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
            const totalReceived = items.reduce((sum, it) => {
                const received = (it.grnItems || []).reduce((s: number, g: any) => s + g.receivedQty, 0)
                return sum + received
            }, 0)
            const totalInvoiced = items.reduce((sum, it) => {
                const invoiced = (it.invoiceItems || []).reduce((s: number, i: any) => s + i.invoicedQty, 0)
                return sum + invoiced
            }, 0)

            return (
                <div className="flex flex-col gap-2 py-1">
                    <OrderProgress
                        label="Received"
                        current={totalReceived}
                        total={totalOrdered}
                        color="bg-emerald-500"
                    />
                    <OrderProgress
                        label="Invoiced"
                        current={totalInvoiced}
                        total={totalReceived}
                        color="bg-sky-500"
                    />
                </div>
            )
        }
    },

    {
        id: 'actions',
        cell: ({ row }) => {
            const po = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this Purchase Order?')) {
                    const result = await deletePurchaseOrder(po.id)
                    if (result.success) {
                        toast.success('PO deleted successfully')
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
                            <Link href={`/dashboard/fab-tex/purchase/purchase-order/${po.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/fab-tex/purchase/purchase-order/${po.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
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
