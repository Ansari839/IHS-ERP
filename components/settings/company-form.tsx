"use client"

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
import { toast } from "sonner"
import { useState } from "react"
import { updateCompanyProfile } from "@/app/actions/settings"

const formSchema = z.object({
    legalName: z.string().min(2, "Legal name is required"),
    tradeName: z.string().optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    taxId: z.string().optional(),
    // logoUrl: z.string().url().optional(), // TODO: Helper for image upload
})

interface CompanyFormProps {
    initialData?: {
        legalName: string
        tradeName?: string | null
        address?: string | null
        country?: string | null
        phone?: string | null
        email?: string | null
        taxId?: string | null
        logoUrl?: string | null
    }
}

export function CompanyForm({ initialData }: CompanyFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            legalName: initialData?.legalName || "",
            tradeName: initialData?.tradeName || "",
            address: initialData?.address || "",
            country: initialData?.country || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            taxId: initialData?.taxId || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await updateCompanyProfile(values)
            toast.success("Company profile updated")
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="legalName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Legal Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Corp Ltd." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tradeName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trade Name (Brand)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax ID / NTN</FormLabel>
                                <FormControl>
                                    <Input placeholder="1234567-8" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1 234 567 890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="info@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input placeholder="United States" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, City, State" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
