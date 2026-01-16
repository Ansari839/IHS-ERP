
"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTree } from "@/components/finance/account-tree";
import { AccountForm } from "@/components/finance/account-form";
import { AccountHierarchyNode } from "@/types/finance.types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function COAPage() {
    const [data, setData] = useState<AccountHierarchyNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountHierarchyNode | null>(null);
    const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

    const fetchHierarchy = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/finance/accounts/hierarchy");
            const result = await resp.json();
            if (Array.isArray(result)) {
                setData(result);
            }
        } catch (error) {
            console.error("[UI] Failed to load Chart of Accounts:", error);
            toast.error("Failed to load Chart of Accounts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const handleSetupDefault = async () => {
        const confirm = window.confirm("This will initialize a standard Chart of Accounts. Continue?");
        if (!confirm) return;

        try {
            const resp = await fetch("/api/finance/setup/coa", { method: "POST" });
            if (resp.ok) {
                toast.success("Default COA initialized successfully");
                fetchHierarchy();
            } else {
                const err = await resp.json();
                throw new Error(err.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddRoot = () => {
        setEditingAccount(null);
        setSelectedParentId(null);
        setIsFormOpen(true);
    };

    const handleAddChild = (parentId: number) => {
        setEditingAccount(null);
        setSelectedParentId(parentId);
        setIsFormOpen(true);
    };

    const handleEdit = (account: AccountHierarchyNode) => {
        setEditingAccount(account);
        setSelectedParentId(account.parentId);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this account?")) return;

        try {
            const resp = await fetch(`/api/finance/accounts/${id}`, { method: "DELETE" });
            if (resp.ok) {
                toast.success("Account deleted");
                fetchHierarchy();
            } else {
                const err = await resp.json();
                throw new Error(err.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
                    <p className="text-muted-foreground underline">
                        Manage your financial architecture and account hierarchy.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleSetupDefault} disabled={data.length > 0}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Setup Default COA
                    </Button>
                    <Button onClick={handleAddRoot}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center space-x-2 border-b">
                    <Network className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                        < CardTitle className="text-xl">Account Hierarchy</CardTitle>
                        <CardDescription>Expand nodes to see sub-accounts</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCcw className="w-8 h-8 animate-spin text-primary/50" />
                        </div>
                    ) : (
                        <AccountTree
                            data={data}
                            onEdit={handleEdit}
                            onAddChild={handleAddChild}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAccount ? "Edit Account" : "Add New Account"}</DialogTitle>
                        <DialogDescription>
                            {editingAccount ? "Update the account details below." : "Create a new account in your hierarchy."}
                        </DialogDescription>
                    </DialogHeader>
                    <AccountForm
                        initialData={editingAccount}
                        parentId={selectedParentId}
                        onSuccess={() => {
                            setIsFormOpen(false);
                            fetchHierarchy();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
