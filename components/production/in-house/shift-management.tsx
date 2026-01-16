"use client"

import { useState } from "react"
import { Plus, Search, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ShiftForm } from "./shift-form"
import { DeleteShiftButton } from "./delete-shift-button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Shift {
    id: number
    name: string
    startTime: string
    endTime: string
}

interface ShiftManagementProps {
    initialShifts: Shift[]
}

export function ShiftManagement({ initialShifts }: ShiftManagementProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingShift, setEditingShift] = useState<Shift | null>(null)

    const filteredShifts = initialShifts.filter(shift =>
        shift.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shifts</h2>
                    <p className="text-muted-foreground">
                        Manage production shifts and timing.
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Shift
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Shift</DialogTitle>
                        </DialogHeader>
                        <ShiftForm onSuccess={() => setIsAddDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shifts..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredShifts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No shifts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredShifts.map((shift) => (
                                <TableRow key={shift.id}>
                                    <TableCell className="font-medium">{shift.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{shift.startTime}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{shift.endTime}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog open={editingShift?.id === shift.id} onOpenChange={(open) => !open && setEditingShift(null)}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingShift(shift)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Shift</DialogTitle>
                                                    </DialogHeader>
                                                    <ShiftForm
                                                        shift={shift}
                                                        onSuccess={() => setEditingShift(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <DeleteShiftButton shiftId={shift.id} shiftName={shift.name} />
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
