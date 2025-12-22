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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createConversion, updateConversion } from "@/app/actions/inventory"

const formSchema = z.object({
    fromUnitId: z.coerce.number().min(1, "Select source unit"),
    toUnitId: z.coerce.number().min(1, "Select target unit"),
    conversionRate: z.coerce.number().min(0.000001, "Rate must be positive"),
}).refine(data => data.fromUnitId !== data.toUnitId, {
    message: "Source and target units must be different",
    path: ["toUnitId"],
})

interface ConversionFormProps {
    conversion?: {
        id: number
        fromUnitId: number
        toUnitId: number
        conversionRate: number
    }
    units: {
        id: number
        name: string
        symbol: string
        unitType: string
    }[]
    setOpen?: (open: boolean) => void
}

export function ConversionForm({ conversion, units, setOpen }: ConversionFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromUnitId: conversion?.fromUnitId || 0,
            toUnitId: conversion?.toUnitId || 0,
            conversionRate: conversion?.conversionRate || 1,
        },
    })

    const selectedFromUnitId = form.watch("fromUnitId")
    const selectedFromUnit = units.find(u => u.id === selectedFromUnitId)

    // Filter target units to match type of source unit
    const filteredToUnits = selectedFromUnit
        ? units.filter(u => u.unitType === selectedFromUnit.unitType && u.id !== selectedFromUnitId)
        : units

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            if (conversion) {
                await updateConversion(conversion.id, values)
                toast.success("Conversion updated successfully")
            } else {
                await createConversion(values)
                toast.success("Conversion created successfully")
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fromUnitId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Unit</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val))
                                        // Reset toUnit if type mismatch or same
                                        form.setValue("toUnitId", 0)
                                    }}
                                    defaultValue={field.value ? String(field.value) : undefined}
                                    disabled={!!conversion} // Prevent changing units on edit for simplicity, or allowed? Generally better to delete and recreate.
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                {unit.name} ({unit.symbol})
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
                        name="toUnitId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Unit</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    defaultValue={field.value ? String(field.value) : undefined}
                                    disabled={!selectedFromUnitId || !!conversion}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredToUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                {unit.name} ({unit.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <FormField
                            control={form.control}
                            name="conversionRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conversion Rate</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.000001" {...field} value={field.value as string | number} />
                                    </FormControl>
                                    <FormDescription>
                                        1 {selectedFromUnit?.symbol || 'Unit'} = {field.value as string | number} Target Unit
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : conversion ? "Update Conversion" : "Create Conversion"}
                </Button>
            </form>
        </Form>
    )
}
