'use client'

import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { deleteGRN } from '@/app/actions/fabtex/grn'
import { toast } from 'sonner'

interface GRNActionsProps {
    grnId: string
}

export function GRNActions({ grnId }: GRNActionsProps) {
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this GRN?')) {
            const result = await deleteGRN(grnId)
            if (result.success) {
                toast.success(result.message)
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
                    <Link href={`/dashboard/fab-tex/purchase/grn/${grnId}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/fab-tex/purchase/grn/${grnId}/edit`}>
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
}
