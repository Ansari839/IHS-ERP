
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Account } from "@/types/finance.types";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]),
    parentId: z.string().optional().nullable(),
    isPosting: z.boolean(),
    openingBalance: z.coerce.number(),
    openingBalanceType: z.enum(["DR", "CR"]),
});

interface AccountFormProps {
    initialData?: Account | null;
    parentId?: number | null;
    onSuccess: () => void;
}

export function AccountForm({ initialData, parentId, onSuccess }: AccountFormProps) {
    const [loading, setLoading] = useState(false);
    const [summaryAccounts, setSummaryAccounts] = useState<Account[]>([]);

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            type: initialData.type,
            parentId: initialData.parentId?.toString() || "none",
            isPosting: initialData.isPosting,
            openingBalance: initialData.openingBalance || 0,
            openingBalanceType: initialData.openingBalanceType || "DR",
        } : {
            name: "",
            type: "ASSET",
            parentId: parentId?.toString() || "none",
            isPosting: true,
            openingBalance: 0,
            openingBalanceType: "DR",
        },
    });

    useEffect(() => {
        const fetchSummaryAccounts = async () => {
            try {
                const resp = await fetch("/api/finance/accounts");
                const data = await resp.json();
                if (Array.isArray(data)) {
                    setSummaryAccounts(data.filter((acc: Account) => !acc.isPosting));
                }
            } catch (e) {
                console.error("Failed to fetch accounts", e);
            }
        };
        fetchSummaryAccounts();
    }, []);

    // Watch for parentId changes to update account type
    const watchedParentId = form.watch("parentId");
    useEffect(() => {
        if (watchedParentId && watchedParentId !== "none" && summaryAccounts.length > 0) {
            const parentAccount = summaryAccounts.find(acc => acc.id.toString() === watchedParentId);
            if (parentAccount) {
                form.setValue("type", parentAccount.type);
            }
        }
    }, [watchedParentId, summaryAccounts, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const payload = {
                ...values,
                parentId: (values.parentId && values.parentId !== "none") ? parseInt(values.parentId) : null,
            };

            const url = initialData
                ? `/api/finance/accounts/${initialData.id}`
                : "/api/finance/accounts";
            const method = initialData ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to save account");
            }

            toast.success(initialData ? "Account updated" : "Account created");
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
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
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Cash in Hand" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ASSET">Asset</SelectItem>
                                        <SelectItem value="LIABILITY">Liability</SelectItem>
                                        <SelectItem value="EQUITY">Equity</SelectItem>
                                        <SelectItem value="INCOME">Income</SelectItem>
                                        <SelectItem value="EXPENSE">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="parentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Account</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || "none"}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Root" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Root (No Parent)</SelectItem>
                                        {summaryAccounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.code} - {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isPosting"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Posting Account</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Can this account have transactions posted to it? (e.g., Summary accounts cannot)
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="openingBalance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Opening Balance</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="openingBalanceType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Balance Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="DR/CR" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DR">Debit (DR)</SelectItem>
                                        <SelectItem value="CR">Credit (CR)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : initialData ? "Update Account" : "Create Account"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
