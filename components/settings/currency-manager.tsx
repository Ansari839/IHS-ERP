"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check } from "lucide-react"

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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createCurrency, setBaseCurrency, deleteCurrency } from "@/app/actions/settings"

const formSchema = z.object({
    code: z.string().min(3, "Code must be 3 chars").max(3).toUpperCase(),
    symbol: z.string().min(1, "Symbol is required"),
    exchangeRate: z.coerce.number().min(0.000001, "Invalid rate"),
})

interface Currency {
    id: number
    code: string
    symbol: string
    exchangeRate: number
    isBase: boolean
}

interface CurrencyManagerProps {
    currencies: Currency[]
}

export function CurrencyManager({ currencies }: CurrencyManagerProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            symbol: "",
            exchangeRate: 1.0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await createCurrency(values)
            toast.success("Currency added")
            setOpen(false)
            form.reset()
        } catch (error) {
            toast.error("Failed to add currency")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSetBase(id: number) {
        try {
            await setBaseCurrency(id)
            toast.success("Base currency updated")
        } catch (error) {
            toast.error("Failed to set base currency")
        }
    }

    async function handleDelete(id: number) {
        try {
            await deleteCurrency(id)
            toast.success("Currency deleted")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Currencies</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Currency</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Currency</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code (e.g. USD)</FormLabel>
                                            <FormControl>
                                                <Input maxLength={3} placeholder="USD" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="symbol"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Symbol (e.g. $)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="$" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="exchangeRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exchange Rate (Relative to Base)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.0001" {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormDescription>
                                                1 Base = X This Currency. If this is base, rate is ignored (1.0).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Adding..." : "Add Currency"}
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
                            <TableHead>Code</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Exchange Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currencies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No currencies defined</TableCell>
                            </TableRow>
                        ) : (
                            currencies.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.code}</TableCell>
                                    <TableCell>{c.symbol}</TableCell>
                                    <TableCell>{c.exchangeRate}</TableCell>
                                    <TableCell>
                                        {c.isBase && <Badge variant="secondary">Base Currency</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!c.isBase && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => handleSetBase(c.id)}>
                                                        Set as Base
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-red-600" onClick={() => handleDelete(c.id)}>
                                                        Delete
                                                    </Button>
                                                </>
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
