
"use client";

import { useEffect, useState } from "react";
import { Plus, ReceiptText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoucherList } from "@/components/finance/voucher-list";
import { JournalForm } from "@/components/finance/journal-form";
import { JournalEntry } from "@/types/finance.types";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function VouchersPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/finance/vouchers");
            const result = await resp.json();
            if (Array.isArray(result)) {
                setEntries(result);
            }
        } catch {
            toast.error("Failed to load vouchers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Vouchers</h2>
                    <p className="text-muted-foreground underline">
                        Manage financial transactions and journal entries.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Voucher
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vouchers by number, reference or narration..." className="pl-9 bg-card/50" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center space-x-2 border-b">
                    <ReceiptText className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                        < CardTitle className="text-xl">Transaction History</CardTitle>
                        <CardDescription>View recent financial entries and status</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Plus className="w-8 h-8 animate-spin text-primary/50" />
                        </div>
                    ) : (
                        <VoucherList entries={entries} />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Journal Entry</DialogTitle>
                        <DialogDescription>
                            Create a balanced double-entry voucher.
                        </DialogDescription>
                    </DialogHeader>
                    <JournalForm
                        onSuccess={() => {
                            setIsFormOpen(false);
                            fetchVouchers();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
