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
import { toast } from "sonner"
import { useState } from "react"
import { updateSystemConfig } from "@/app/actions/settings"

const formSchema = z.object({
    quantityDecimals: z.coerce.number().min(0).max(6),
    amountDecimals: z.coerce.number().min(0).max(4),
    rateDecimals: z.coerce.number().min(0).max(6),
})

interface PrecisionFormProps {
    initialData?: {
        quantityDecimals: number
        amountDecimals: number
        rateDecimals: number
    }
}

export function PrecisionForm({ initialData }: PrecisionFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantityDecimals: initialData?.quantityDecimals || 2,
            amountDecimals: initialData?.amountDecimals || 2,
            rateDecimals: initialData?.rateDecimals || 4,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await updateSystemConfig(values)
            toast.success("System precision updated")
        } catch (error) {
            toast.error("Failed to update precision")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                <FormField
                    control={form.control}
                    name="quantityDecimals"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity Decimals</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value as number} />
                            </FormControl>
                            <FormDescription>
                                Decimal places for inventory quantities (e.g. 3 for 1.250 kg)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amountDecimals"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount Decimals (Currency)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value as number} />
                            </FormControl>
                            <FormDescription>
                                Decimal places for monetary values (e.g. 2 for $10.50)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rateDecimals"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rate/Price Decimals</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value as number} />
                            </FormControl>
                            <FormDescription>
                                Decimal places for unit prices and exchange rates (e.g. 4 for precision)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
