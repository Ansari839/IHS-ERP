"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    code: z.string().min(2, "Code must be at least 2 characters."),
    type: z.string().optional().or(z.literal("")),
    status: z.string().min(1, "Status is required"),
    locationId: z.string().optional().or(z.literal("")),
})

interface MachineFormProps {
    machine?: {
        id: number
        name: string
        code: string
        type: string | null
        status: string
        locationId: number | null
    }
    onSuccess?: () => void
}

export function MachineForm({ machine, onSuccess }: MachineFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [locations, setLocations] = useState<{ id: number, name: string }[]>([])

    useEffect(() => {
        async function fetchLocations() {
            try {
                const response = await fetch("/api/production/locations")
                if (response.ok) {
                    const data = await response.json()
                    setLocations(data)
                }
            } catch (error) {
                console.error("Failed to fetch locations:", error)
            }
        }
        fetchLocations()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: machine?.name || "",
            code: machine?.code || "",
            type: machine?.type || "",
            status: machine?.status || "ACTIVE",
            locationId: machine?.locationId?.toString() || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = machine
                ? `/api/production/in-house/machines/${machine.id}`
                : "/api/production/in-house/machines"
            const method = machine ? "PUT" : "POST"

            const payload = {
                ...values,
                locationId: values.locationId === "none" ? null : values.locationId
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            toast.success(machine ? "Machine updated successfully" : "Machine created successfully")
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Slasher 01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Machine Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. MAC-101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Machine Type</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Yarn Slasher" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">No Location</SelectItem>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id.toString()}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {machine ? "Update Machine" : "Create Machine"}
                </Button>
            </form>
        </Form>
    )
}
