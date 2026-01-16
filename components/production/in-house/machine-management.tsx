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
import { MachineForm } from "./machine-form"
import { DeleteMachineButton } from "./delete-machine-button"
import { Badge } from "@/components/ui/badge"

interface Machine {
    id: number
    name: string
    code: string
    type: string | null
    status: string
    locationId: number | null
    location?: {
        name: string
    } | null
}

interface MachineManagementProps {
    initialMachines: Machine[]
}

export function MachineManagement({ initialMachines }: MachineManagementProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null)

    const filteredMachines = initialMachines.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Machines</h2>
                    <p className="text-muted-foreground">
                        Manage production machinery and assets.
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Machine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Machine</DialogTitle>
                        </DialogHeader>
                        <MachineForm onSuccess={() => setIsAddDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or code..."
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
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMachines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No machines found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMachines.map((machine) => (
                                <TableRow key={machine.id}>
                                    <TableCell className="font-mono text-xs">{machine.code}</TableCell>
                                    <TableCell className="font-medium">{machine.name}</TableCell>
                                    <TableCell>{machine.type || "-"}</TableCell>
                                    <TableCell>
                                        {machine.location?.name ? (
                                            <Badge variant="outline">{machine.location.name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Not assigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            machine.status === "ACTIVE"
                                                ? "default"
                                                : machine.status === "MAINTENANCE"
                                                    ? "destructive"
                                                    : "secondary"
                                        }>
                                            {machine.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog open={editingMachine?.id === machine.id} onOpenChange={(open) => !open && setEditingMachine(null)}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingMachine(machine)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Machine</DialogTitle>
                                                    </DialogHeader>
                                                    <MachineForm
                                                        machine={machine}
                                                        onSuccess={() => setEditingMachine(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <DeleteMachineButton machineId={machine.id} machineName={machine.name} />
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
