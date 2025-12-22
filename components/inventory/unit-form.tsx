"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createUnit, updateUnit } from "@/app/actions/inventory"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    symbol: z.string().min(1, {
        message: "Symbol must be at least 1 character.",
    }),
    unitType: z.enum(["WEIGHT", "LENGTH", "COUNT", "VOLUME", "AREA"], {
        required_error: "Please select a unit type.",
    }),
    isBase: z.boolean().default(false),
})

interface UnitFormProps {
    unit?: {
        id: number
        name: string
        symbol: string
        unitType: string
        isBase: boolean
    }
    setOpen?: (open: boolean) => void
}

export function UnitForm({ unit, setOpen }: UnitFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: unit?.name || "",
            symbol: unit?.symbol || "",
            unitType: (unit?.unitType as any) || "WEIGHT",
            isBase: unit?.isBase || false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            if (unit) {
                await updateUnit(unit.id, values)
                toast.success("Unit updated successfully")
            } else {
                await createUnit(values)
                toast.success("Unit created successfully")
            }
            router.refresh()
            setOpen?.(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Kilogram" {...field} />
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
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                                <Input placeholder="kg" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unitType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a unit type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="WEIGHT">Weight</SelectItem>
                                    <SelectItem value="LENGTH">Length</SelectItem>
                                    <SelectItem value="COUNT">Count</SelectItem>
                                    <SelectItem value="VOLUME">Volume</SelectItem>
                                    <SelectItem value="AREA">Area</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isBase"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Base Unit
                                </FormLabel>
                                <FormDescription>
                                    Set this as the base unit for calculations.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
                </Button>
            </form>
        </Form>
    )
}
