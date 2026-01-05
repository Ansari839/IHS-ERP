'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

type AuditLog = {
    id: string
    userId: number
    user: { name: string | null; email: string }
    action: string
    module: string
    resourceId: string | null
    before: any
    after: any
    metadata: any
    timestamp: string
}

type Meta = {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [meta, setMeta] = useState<Meta | null>(null)
    const [loading, setLoading] = useState(true)

    // Filters
    const [page, setPage] = useState(1)
    const [moduleFilter, setModuleFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [userIdFilter, setUserIdFilter] = useState('ALL')
    const [monitorableUsers, setMonitorableUsers] = useState<{ id: number; name: string | null; email: string }[]>([])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/audit-logs/users')
            const data = await res.json()
            if (Array.isArray(data)) {
                setMonitorableUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch monitorable users:', error)
        }
    }

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            })
            if (moduleFilter && moduleFilter !== 'ALL') params.append('module', moduleFilter)
            if (actionFilter && actionFilter !== 'ALL') params.append('action', actionFilter)
            if (userIdFilter && userIdFilter !== 'ALL') params.append('userId', userIdFilter)

            const res = await fetch(`/api/admin/audit-logs?${params}`)
            const data = await res.json()

            if (data.data) {
                setLogs(data.data)
                setMeta(data.meta)
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        fetchLogs()
    }, [page, moduleFilter, actionFilter, userIdFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchLogs()
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <Select value={userIdFilter} onValueChange={setUserIdFilter}>
                            <SelectTrigger className="flex-1 min-w-[200px]">
                                <SelectValue placeholder="Filter by User..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Authorized Users</SelectItem>
                                {monitorableUsers.map((u) => (
                                    <SelectItem key={u.id} value={u.id.toString()}>
                                        {u.name || u.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Module" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Modules</SelectItem>
                                <SelectItem value="ROLES">Roles</SelectItem>
                                <SelectItem value="USERS">Users</SelectItem>
                                <SelectItem value="PRODUCTS">Products</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                <SelectItem value="CREATE">Create</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.user.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    log.action === 'CREATE' ? 'default' :
                                                        log.action === 'DELETE' ? 'destructive' :
                                                            log.action === 'UPDATE' ? 'secondary' : 'outline'
                                                }>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{log.module}</TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">View Changes</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Log Details</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Before</h4>
                                                                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[400px]">
                                                                    {log.before ? JSON.stringify(log.before, null, 2) : 'N/A'}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold mb-2">After</h4>
                                                                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[400px]">
                                                                    {log.after ? JSON.stringify(log.after, null, 2) : 'N/A'}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <h4 className="font-semibold mb-2">Metadata</h4>
                                                            <pre className="bg-muted p-4 rounded-md text-xs">
                                                                {JSON.stringify({
                                                                    id: log.id,
                                                                    resourceId: log.resourceId,
                                                                    ...log.metadata
                                                                }, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {meta.page} of {meta.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
