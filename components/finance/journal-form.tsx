
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/types/finance.types";

const lineSchema = z.object({
    accountId: z.string().min(1, "Account is required"),
    debit: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
    credit: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
    narration: z.string().optional(),
}).refine(data => {
    return (data.debit > 0 || data.credit > 0);
}, {
    message: "Either Debit or Credit must be greater than 0",
    path: ["debit"]
}).refine(data => {
    return !(data.debit > 0 && data.credit > 0);
}, {
    message: "A single line cannot have both Debit and Credit",
    path: ["debit"]
});

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(["JOURNAL", "PAYMENT", "RECEIPT", "PURCHASE", "SALES", "CONTRA"]),
    reference: z.string().optional(),
    narration: z.string().optional(),
    lines: z.array(lineSchema).min(2, "At least two lines are required"),
});

interface JournalFormProps {
    onSuccess: () => void;
}

interface JournalFormValues {
    date: string;
    type: "JOURNAL" | "PAYMENT" | "RECEIPT" | "PURCHASE" | "SALES" | "CONTRA";
    reference?: string;
    narration?: string;
    lines: {
        accountId: string;
        debit: number;
        credit: number;
        narration?: string;
    }[];
}

export function JournalForm({ onSuccess }: JournalFormProps) {
    const [loading, setLoading] = useState(false);
    const [postingAccounts, setPostingAccounts] = useState<Account[]>([]);

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            type: "JOURNAL",
            lines: [
                { accountId: "", debit: 0, credit: 0, narration: "" },
                { accountId: "", debit: 0, credit: 0, narration: "" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    useEffect(() => {
        const fetchAccounts = async () => {
            const resp = await fetch("/api/finance/accounts");
            const data = await resp.json();
            if (Array.isArray(data)) {
                setPostingAccounts(data.filter((acc: Account) => acc.isPosting));
            }
        };
        fetchAccounts();
    }, []);

    const totalDebit = form.watch("lines").reduce((sum: number, line: any) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = form.watch("lines").reduce((sum: number, line: any) => sum + (Number(line.credit) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01;

    async function onSubmit(values: JournalFormValues) {
        if (!isBalanced) {
            toast.error("Voucher is not balanced!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...values,
                date: new Date(values.date),
                lines: values.lines.map((line: { accountId: string; debit: number; credit: number; narration?: string }) => ({
                    ...line,
                    accountId: parseInt(line.accountId),
                })),
            };

            const response = await fetch("/api/finance/vouchers", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to save voucher");
            }

            toast.success("Voucher created successfully");
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Voucher Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Voucher Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="JOURNAL">Journal Voucher</SelectItem>
                                        <SelectItem value="PAYMENT">Payment Voucher</SelectItem>
                                        <SelectItem value="RECEIPT">Receipt Voucher</SelectItem>
                                        <SelectItem value="CONTRA">Contra Voucher</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Lines</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: "", debit: 0, credit: 0, narration: "" })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Line
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-2 rounded-md bg-muted/30">
                                <div className="col-span-4">
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.accountId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Account" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {postingAccounts.map((acc) => (
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
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.debit`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Debit" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.credit`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Credit" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.narration`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Line Narration" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1 pt-1">
                                    <Button type="button" variant="ghost" size="icon" disabled={fields.length <= 2} onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                        <span>Total Debit:</span>
                        <span className="font-mono font-bold text-success">{totalDebit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Total Credit:</span>
                        <span className="font-mono font-bold text-success">{totalCredit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                        <span>Difference:</span>
                        <span className={cn("font-mono", difference > 0 ? "text-destructive" : "text-success")}>
                            {difference.toFixed(2)}
                        </span>
                    </div>
                </div>

                {!isBalanced && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Voucher lines must balance. Current difference: {difference.toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={loading || !isBalanced}>
                        {loading ? "Posting..." : "Post Voucher"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
