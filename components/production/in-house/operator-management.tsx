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
import { OperatorForm } from "./operator-form"
import { DeleteOperatorButton } from "./delete-operator-button"
import { Badge } from "@/components/ui/badge"

interface Operator {
    id: number
    name: string
    code: string
    contact: string | null
    status: string
}

interface OperatorManagementProps {
    initialOperators: Operator[]
}

export function OperatorManagement({ initialOperators }: OperatorManagementProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingOperator, setEditingOperator] = useState<Operator | null>(null)

    const filteredOperators = initialOperators.filter(operator =>
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Operators</h2>
                    <p className="text-muted-foreground">
                        Manage production operators and employee details.
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Operator
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Operator</DialogTitle>
                        </DialogHeader>
                        <OperatorForm onSuccess={() => setIsAddDialogOpen(false)} />
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
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOperators.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No operators found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOperators.map((operator) => (
                                <TableRow key={operator.id}>
                                    <TableCell className="font-mono text-xs">{operator.code}</TableCell>
                                    <TableCell className="font-medium">{operator.name}</TableCell>
                                    <TableCell>{operator.contact || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={operator.status === "ACTIVE" ? "default" : "secondary"}>
                                            {operator.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog open={editingOperator?.id === operator.id} onOpenChange={(open) => !open && setEditingOperator(null)}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingOperator(operator)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Operator</DialogTitle>
                                                    </DialogHeader>
                                                    <OperatorForm
                                                        operator={operator}
                                                        onSuccess={() => setEditingOperator(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <DeleteOperatorButton operatorId={operator.id} operatorName={operator.name} />
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
