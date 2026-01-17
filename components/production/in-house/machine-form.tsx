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
import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Barcode, Factory, Settings2, Calendar, MapPin, Activity, Settings } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    code: z.string().min(2, "Code must be at least 2 characters."),
    model: z.string().optional(),
    make: z.string().optional(),
    year: z.string().optional(),
    type: z.string().optional().or(z.literal("")),
    status: z.string().min(1, "Status is required"),
    locationId: z.string().optional().or(z.literal("")),
})

interface MachineFormProps {
    machine?: {
        id: number
        name: string
        code: string
        model?: string | null
        make?: string | null
        year?: number | null
        type: string | null
        status: string
        locationId: number | null
    }
    onSuccess?: () => void
}

export function MachineForm({ machine, onSuccess }: MachineFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [locations, setLocations] = useState<{ id: number; name: string }[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: machine?.name || "",
            code: machine?.code || "",
            model: machine?.model || "",
            make: machine?.make || "",
            year: machine?.year?.toString() || new Date().getFullYear().toString(),
            type: machine?.type || "",
            status: machine?.status || "ACTIVE",
            locationId: machine?.locationId?.toString() || "",
        },
    })

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch("/api/production/locations")
                const data = await res.json()
                setLocations(data)
            } catch (error) {
                console.error("Error fetching locations:", error)
            }
        }
        fetchLocations()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = machine
                ? `/api/production/machines/${machine.id}`
                : "/api/production/machines"
            const method = machine ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast.success(machine ? "Machine updated successfully" : "Machine created successfully")
            router.refresh()
            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Machine Identity & Status */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="bg-card/40 backdrop-blur-sm border-primary/10 shadow-lg">
                            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                                <Cpu className="w-4 h-4 text-primary" />
                                                Machine Name
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Cpu className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                    <Input
                                                        placeholder="e.g. Weaving Machine A1"
                                                        className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                        {...field}
                                                    />
                                                </div>
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
                                            <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                                <Barcode className="w-4 h-4 text-primary" />
                                                Machine Code
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                    <Input
                                                        placeholder="e.g. MC-001"
                                                        className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Technical Specs */}
                    <Card className="bg-card/40 backdrop-blur-sm border-primary/10 shadow-lg md:col-span-2">
                        <CardContent className="pt-6 grid gap-6 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="make"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Factory className="w-4 h-4 text-primary" />
                                            Make / Manufacturer
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Factory className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    placeholder="Manufacturer Name"
                                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Settings2 className="w-4 h-4 text-primary" />
                                            Model Number
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Settings2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    placeholder="Model X-2000"
                                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            Year
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    type="number"
                                                    placeholder="2024"
                                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Location & Status */}
                    <Card className="bg-card/40 backdrop-blur-sm border-primary/10 shadow-lg md:col-span-2">
                        <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="locationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Location / Unit
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locations.map((location) => (
                                                    <SelectItem
                                                        key={location.id}
                                                        value={location.id.toString()}
                                                    >
                                                        {location.name}
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
                                        <FormLabel className="flex items-center gap-2 text-primary font-medium">
                                            <Activity className="w-4 h-4 text-primary" />
                                            Operational Status
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                                        Active
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="MAINTENANCE">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                        Maintenance
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="INACTIVE">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                                        Inactive
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                        {isLoading && <Settings className="mr-2 h-4 w-4 animate-spin" />}
                        {machine ? "Update Machine" : "Create Machine"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}


