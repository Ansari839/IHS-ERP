"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { LocationForm } from "./location-form"
import { DeleteLocationButton } from "./delete-location-button"
import { format } from "date-fns"
import { Plus, Pencil } from "lucide-react"

interface Location {
    id: number
    name: string
    description: string | null
    status: string
    createdAt: Date
    updatedAt: Date
}

interface LocationManagementProps {
    initialLocations: Location[]
}

export function LocationManagement({ initialLocations }: LocationManagementProps) {
    const router = useRouter()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editLocation, setEditLocation] = useState<Location | null>(null)

    const handleSuccess = () => {
        setIsAddOpen(false)
        setEditLocation(null)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Locations</h1>
                    <p className="text-muted-foreground">Manage physical or logical areas where production activities occur.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Location
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Location</DialogTitle>
                        </DialogHeader>
                        <LocationForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialLocations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No locations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialLocations.map((location) => (
                                <TableRow key={location.id}>
                                    <TableCell className="font-medium">{location.name}</TableCell>
                                    <TableCell>{location.description || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={location.status === "ACTIVE" ? "default" : "secondary"}>
                                            {location.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(location.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog
                                                open={editLocation?.id === location.id}
                                                onOpenChange={(open) => !open && setEditLocation(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditLocation(location)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Location</DialogTitle>
                                                    </DialogHeader>
                                                    <LocationForm
                                                        location={location}
                                                        onSuccess={handleSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteLocationButton id={location.id} name={location.name} />
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
