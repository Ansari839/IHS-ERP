'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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
} from '@/components/ui/dialog'
import { AccountForm } from '@/components/finance/account-form'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PartyListClientProps {
    initialData: any[]
    type: 'Vendor' | 'Customer'
    segment: string
    accountType: string
}

export function PartyListClient({ initialData, type, segment, accountType }: PartyListClientProps) {
    const router = useRouter()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<any>(null)

    const handleEdit = (account: any) => {
        setEditingAccount(account)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

        try {
            const resp = await fetch(`/api/finance/accounts/${id}`, { method: 'DELETE' })
            if (resp.ok) {
                toast.success(`${type} deleted`)
                router.refresh()
            } else {
                const err = await resp.json()
                toast.error(err.message || `Failed to delete ${type}`)
            }
        } catch (error) {
            toast.error(`An error occurred while deleting ${type}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        {type}s
                    </h2>
                    <p className="text-muted-foreground">
                        Manage your {type.toLowerCase()}s for the {segment} segment.
                    </p>
                </div>
                <Button onClick={() => { setEditingAccount(null); setIsFormOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {type}
                </Button>
            </div>

            <div className="rounded-xl border overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Closing Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                    No {type.toLowerCase()}s found for this segment.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.map((acc) => (
                                <TableRow key={acc.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-mono text-xs">{acc.code}</TableCell>
                                    <TableCell className="font-semibold">
                                        {/* Only link if it's a Vendor for now, though Customer works too */}
                                        <Link
                                            href={`/dashboard/fab-tex/purchase/vendors/${acc.id}`}
                                            className="hover:underline text-blue-600"
                                        >
                                            {acc.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-background">
                                            {acc.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold">
                                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(Math.abs(acc.closingBalance || 0))}
                                        {(acc.closingBalance || 0) >= 0 ? ' CR' : ' DR'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {/* We can add delete button here if needed */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAccount ? `Edit ${type}` : `Add New ${type}`}</DialogTitle>
                    </DialogHeader>
                    <AccountForm
                        initialData={editingAccount}
                        segment={segment}
                        onSuccess={() => {
                            setIsFormOpen(false)
                            router.refresh()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
