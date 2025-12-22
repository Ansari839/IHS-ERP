"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Lock, Check } from "lucide-react"

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createFiscalYear, activateFiscalYear, lockFiscalYear } from "@/app/actions/settings"

const formSchema = z.object({
    name: z.string().min(4, "Name is required"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
})

interface FiscalYear {
    id: number
    name: string
    startDate: Date
    endDate: Date
    isActive: boolean
    isLocked: boolean
}

interface FiscalYearManagerProps {
    fiscalYears: FiscalYear[]
}

export function FiscalYearManager({ fiscalYears }: FiscalYearManagerProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await createFiscalYear(values)
            toast.success("Fiscal Year created")
            setOpen(false)
            form.reset()
        } catch (error) {
            toast.error("Failed to create Fiscal Year")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleActivate(id: number) {
        try {
            await activateFiscalYear(id)
            toast.success("Fiscal Year activated")
        } catch (error) {
            toast.error("Failed to activate")
        }
    }

    async function handleLock(id: number) {
        try {
            await lockFiscalYear(id)
            toast.success("Fiscal Year locked")
        } catch (error) {
            toast.error("Failed to lock")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Fiscal Years</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Fiscal Year</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Fiscal Year</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name (e.g. FY 2024-25)</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Creating..." : "Create Fiscal Year"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fiscalYears.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No fiscal years defined</TableCell>
                            </TableRow>
                        ) : (
                            fiscalYears.map((fy) => (
                                <TableRow key={fy.id}>
                                    <TableCell className="font-medium">{fy.name}</TableCell>
                                    <TableCell>{format(new Date(fy.startDate), 'PP')}</TableCell>
                                    <TableCell>{format(new Date(fy.endDate), 'PP')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {fy.isActive && <Badge>Active</Badge>}
                                            {fy.isLocked && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!fy.isActive && !fy.isLocked && (
                                                <Button size="sm" variant="outline" onClick={() => handleActivate(fy.id)}>
                                                    Activate
                                                </Button>
                                            )}
                                            {!fy.isLocked && (
                                                <Button size="sm" variant="ghost" onClick={() => handleLock(fy.id)}>
                                                    Lock
                                                </Button>
                                            )}
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
