'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Eye, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { deletePurchaseReturn } from '@/app/actions/fabtex/purchase-return'
import { toast } from 'sonner'

export function ReturnList({ initialData }: { initialData: any[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [returns, setReturns] = useState(initialData)

    const filteredReturns = returns.filter(ret =>
        ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.account?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.purchaseInvoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this return?')) return

        const result = await deletePurchaseReturn(id)
        if (result.success) {
            toast.success(result.message)
            setReturns(returns.filter(r => r.id !== id))
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search returns..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Return #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Against Invoice</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReturns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No returns found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReturns.map((ret) => (
                                <TableRow key={ret.id}>
                                    <TableCell>{format(new Date(ret.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-medium">{ret.returnNumber}</TableCell>
                                    <TableCell>{ret.account?.name || 'N/A'}</TableCell>
                                    <TableCell>{ret.purchaseInvoice?.invoiceNumber || 'Direct'}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        PKR {new Intl.NumberFormat('en-US').format(ret.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={ret.status === 'COMPLETED' ? 'default' : 'outline'}>
                                            {ret.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/fab-tex/purchase/purchase-return/${ret.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ret.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
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
