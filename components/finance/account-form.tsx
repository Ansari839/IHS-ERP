
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
import { Card, CardContent } from "@/components/ui/card"; // Import Card
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Account } from "@/types/finance.types";
import { Layers, Tag, Wallet, FileText, CheckCircle2, DollarSign, Banknote, FolderTree } from "lucide-react"; // Import Icons

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* --- Main Account Details --- */}
                <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary">
                                        <Tag className="w-4 h-4" /> Account Name
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="e.g. Cash in Hand" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <Layers className="w-4 h-4" /> Account Type
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <div className="relative">
                                                    <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
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
                                        <FormLabel className="flex items-center gap-2 text-primary">
                                            <FolderTree className="w-4 h-4" /> Parent Account
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl>
                                                <div className="relative">
                                                    <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                        <SelectValue placeholder="Root" />
                                                    </SelectTrigger>
                                                    <FolderTree className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
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
                    </CardContent>
                </Card>

                {/* --- Configuration & Opening Balance --- */}
                <Card className="border-none shadow-sm bg-muted/30">
                    <CardContent className="p-6 space-y-6">
                        <FormField
                            control={form.control}
                            name="isPosting"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-primary/10 bg-primary/5 p-4 transition-all hover:bg-primary/10">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-2 font-medium text-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Posting Account
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Checking this allows you to post transactions directly to this account.
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
                                        <FormLabel className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-muted-foreground" /> Opening Balance
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type="number" step="0.01" {...field} className="pl-9 font-mono bg-background/80" />
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-bold">PKR</span>
                                            </div>
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
                                        <FormLabel className="flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-muted-foreground" /> Balance Type
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/80">
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
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={loading} className="min-w-[150px] shadow-lg shadow-primary/20">
                        {loading ? "Saving..." : initialData ? "Update Account" : "Create Account"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
