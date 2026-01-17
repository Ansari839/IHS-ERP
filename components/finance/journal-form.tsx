
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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Trash2, Plus, AlertCircle, Calendar, CreditCard, Wallet, FileText, Landmark, Receipt, Calculator, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/types/finance.types";

const lineSchema = z.object({
    accountId: z.string().min(1, "Account is required"),
    debit: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
    credit: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
    amount: z.preprocess((val) => Number(val) || 0, z.number().min(0)).optional(), // Used for Single Entry
    narration: z.string().optional(),
});

// We accept dynamic validation so we refine at the main level
const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(["JOURNAL", "PAYMENT", "RECEIPT", "PURCHASE", "SALES", "CONTRA"]),
    reference: z.string().optional(),
    narration: z.string().optional(),
    bankAccountId: z.string().optional(), // For Single Entry (Cash/Bank)
    lines: z.array(lineSchema).min(1, "At least one line is required"),
}).superRefine((data, ctx) => {
    // Single Entry Validation (PAYMENT / RECEIPT)
    if (["PAYMENT", "RECEIPT"].includes(data.type)) {
        if (!data.bankAccountId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a Bank/Cash account",
                path: ["bankAccountId"],
            });
        }
        if (data.lines.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one line is required",
                path: ["lines"],
            });
        }
        // Check if any line has amount > 0
        const total = data.lines.reduce((s, l) => s + (l.amount || 0), 0);
        if (total <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Total amount must be greater than 0",
                path: ["lines"],
            });
        }
    } else {
        // Double Entry Validation (JOURNAL / CONTRA)
        if (data.lines.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least two lines are required for Double Entry",
                path: ["lines"],
            });
        }
        // Balance Check
        const totalDebit = data.lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = data.lines.reduce((s, l) => s + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Voucher not balanced. Diff: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`,
                path: ["lines"],
            });
        }
    }
});

interface JournalFormProps {
    onSuccess: () => void;
}

interface JournalFormValues {
    date: string;
    type: "JOURNAL" | "PAYMENT" | "RECEIPT" | "PURCHASE" | "SALES" | "CONTRA";
    reference?: string;
    narration?: string;
    bankAccountId?: string;
    lines: {
        accountId: string;
        debit: number;
        credit: number;
        amount?: number;
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
            bankAccountId: "",
            lines: [
                { accountId: "", debit: 0, credit: 0, amount: 0, narration: "" },
            ],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    const voucherType = form.watch("type");
    const isSingleEntry = ["PAYMENT", "RECEIPT"].includes(voucherType);

    useEffect(() => {
        // Reset lines when switching modes
        if (isSingleEntry) {
            replace([{ accountId: "", debit: 0, credit: 0, amount: 0, narration: "" }]);
        } else {
            replace([
                { accountId: "", debit: 0, credit: 0, amount: 0, narration: "" },
                { accountId: "", debit: 0, credit: 0, amount: 0, narration: "" },
            ]);
        }

        // Reset bank account id
        form.setValue('bankAccountId', '');
    }, [voucherType, replace, isSingleEntry, form]); // Added form dependency

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

    // Calculate totals for display
    const lines = form.watch("lines") || [];
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (Number(line.credit) || 0), 0);
    const totalAmount = lines.reduce((sum: number, line: any) => sum + (Number(line.amount) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = !isSingleEntry ? difference < 0.01 : true;

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            let processedLines = [];

            if (isSingleEntry) {
                // Auto-generate the balancing line
                const total = values.lines.reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0);

                // 1. Add user entered lines
                processedLines = values.lines.map((line: any) => ({
                    accountId: parseInt(line.accountId),
                    debit: values.type === "PAYMENT" ? (Number(line.amount) || 0) : 0,  // Payment = Expense (Dr)
                    credit: values.type === "RECEIPT" ? (Number(line.amount) || 0) : 0, // Receipt = Income (Cr)
                    narration: line.narration || values.narration
                }));

                // 2. Add balancing Bank/Cash line
                processedLines.push({
                    accountId: parseInt(values.bankAccountId!),
                    debit: values.type === "RECEIPT" ? total : 0,  // Receipt = Bank (Dr)
                    credit: values.type === "PAYMENT" ? total : 0, // Payment = Bank (Cr)
                    narration: values.narration || "Contra Entry"
                });

            } else {
                // Standard Double Entry
                processedLines = values.lines.map((line: any) => ({
                    ...line,
                    accountId: parseInt(line.accountId),
                    narration: line.narration || values.narration
                }));
            }

            const payload = {
                ...values,
                date: new Date(values.date),
                lines: processedLines,
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* --- Header Section --- */}
                <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Voucher Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary">
                                        <Calendar className="w-4 h-4" /> Voucher Date
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="date" {...field} className="pl-9 bg-background/50 border-primary/20 focus:border-primary" />
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Voucher Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-primary">
                                        <FileText className="w-4 h-4" /> Voucher Type
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <div className="relative">
                                                <SelectTrigger className="pl-9 bg-background/50 border-primary/20 focus:border-primary">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="JOURNAL">Journal Voucher (JV)</SelectItem>
                                            <SelectItem value="PAYMENT">Payment Voucher</SelectItem>
                                            <SelectItem value="RECEIPT">Receipt Voucher</SelectItem>
                                            <SelectItem value="CONTRA">Contra Voucher</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* --- Single Entry: Main Account & Narration --- */}
                {isSingleEntry && (
                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="bankAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-base font-semibold text-primary">
                                            {voucherType === "PAYMENT"
                                                ? <><Wallet className="w-5 h-5 text-amber-500" /> Paid From (Credit Bank/Cash)</>
                                                : <><Landmark className="w-5 h-5 text-emerald-500" /> Received In (Debit Bank/Cash)</>
                                            }
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background border-primary/20 h-12 text-lg">
                                                    <SelectValue placeholder="Select Cash or Bank Account..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {postingAccounts.filter(a => a.type === "ASSET").map((acc) => ( // Minimal filter for assets, preferably explicit cash/bank tag
                                                    <SelectItem key={acc.id} value={acc.id.toString()}>
                                                        {acc.code} - {acc.name}
                                                    </SelectItem>
                                                ))}
                                                {/* Fallback to all if user structure not strict */}
                                                {postingAccounts.filter(a => a.type !== "ASSET").map((acc) => (
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
                            <FormField
                                control={form.control}
                                name="narration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" /> Master Narration
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter main narration for this voucher..." {...field} className="bg-background/80" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                )}


                {/* --- Grid / Lines Section --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            {isSingleEntry ? "Transaction Details" : "Journal Lines"}
                        </h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: "", debit: 0, credit: 0, amount: 0, narration: "" })} className="hover:border-primary hover:text-primary transition-colors">
                            <Plus className="mr-2 h-4 w-4" /> Add Line
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group relative grid grid-cols-12 gap-3 items-start p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/90 hover:shadow-md transition-all duration-300">
                                {/* Line Number Badge (absolute) */}
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {index + 1}
                                </div>

                                <div className={isSingleEntry ? "col-span-5" : "col-span-4"}>
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.accountId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-none bg-background/50 shadow-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background h-10">
                                                            <SelectValue placeholder={isSingleEntry ? (voucherType === 'PAYMENT' ? "Paid To (Expense/Party)" : "Received From (Income/Party)") : "Select Account"} />
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
                                {isSingleEntry ? (
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`lines.${index}.amount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" step="0.01" placeholder="0.00" {...field} className="text-right font-mono pr-8 bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:bg-background h-10" />
                                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">PKR</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.debit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input type="number" step="0.01" placeholder="Dr" {...field} className="text-right font-mono bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:bg-background h-10" />
                                                            </div>
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
                                                            <div className="relative">
                                                                <Input type="number" step="0.01" placeholder="Cr" {...field} className="text-right font-mono bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:bg-background h-10" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className={isSingleEntry ? "col-span-3" : "col-span-3"}>
                                    <FormField
                                        control={form.control}
                                        name={`lines.${index}.narration`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Line Note" {...field} className="bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:bg-background h-10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center pt-2">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={!isSingleEntry && fields.length <= 2} onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Footer / Totals --- */}
                <Card className="border-none bg-muted/30">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                            {isSingleEntry ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium text-muted-foreground">Total Amount</span>
                                    <span className="text-3xl font-mono font-bold text-primary">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Total Debit</span>
                                            <span className="font-mono text-foreground">{totalDebit.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500/50" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Total Credit</span>
                                            <span className="font-mono text-foreground">{totalCredit.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500/50" style={{ width: '100%' }} />
                                        </div>
                                    </div>

                                    {/* Difference Display */}
                                    <div className="col-span-2 flex justify-between items-center pt-2 border-t border-border/50">
                                        <span className="font-medium">Difference</span>
                                        <div className={cn("px-3 py-1 rounded-full text-sm font-mono font-bold flex items-center gap-2",
                                            difference > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        )}>
                                            {difference > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {difference.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => onSuccess()} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !form.formState.isValid} className="min-w-[150px] shadow-lg shadow-primary/20">
                        {loading ? "Posting..." : "Post Voucher"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
