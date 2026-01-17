
"use client";

import { useState } from "react";
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Pencil,
    Trash2,
    Folder,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AccountHierarchyNode } from "@/types/finance.types";

interface AccountNodeProps {
    account: AccountHierarchyNode;
    onEdit: (account: AccountHierarchyNode) => void;
    onAddChild: (parentId: number) => void;
    onDelete: (id: number) => void;
}

function AccountNode({ account, onEdit, onAddChild, onDelete }: AccountNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = account.children && account.children.length > 0;

    return (
        <div className="relative">
            <div className="group flex items-center py-2 px-3 my-1 rounded-lg border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all duration-200">
                <div
                    className="mr-2 p-1 rounded-md hover:bg-background/80 cursor-pointer transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {hasChildren ? (
                        isOpen ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )
                    ) : (
                        <span className="w-4 h-4 block" />
                    )}
                </div>

                <div className="flex items-center flex-1 gap-3">
                    <div className={cn(
                        "p-1.5 rounded-md shadow-sm",
                        account.type === "ASSET" && "bg-emerald-500/10 text-emerald-600",
                        account.type === "LIABILITY" && "bg-red-500/10 text-red-600",
                        account.type === "EQUITY" && "bg-purple-500/10 text-purple-600",
                        account.type === "INCOME" && "bg-blue-500/10 text-blue-600",
                        account.type === "EXPENSE" && "bg-orange-500/10 text-orange-600"
                    )}>
                        {account.isPosting ? (
                            <FileText className="w-4 h-4" />
                        ) : (
                            <Folder className="w-4 h-4" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground tracking-tight">
                            {account.name}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 rounded">
                                {account.code}
                            </span>
                            <span className={cn(
                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border shadow-sm",
                                account.type === "ASSET" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                                account.type === "LIABILITY" && "border-red-200 bg-red-50 text-red-700",
                                account.type === "EXPENSE" && "border-orange-200 bg-orange-50 text-orange-700",
                                account.type === "INCOME" && "border-blue-200 bg-blue-50 text-blue-700",
                                account.type === "EQUITY" && "border-purple-200 bg-purple-50 text-purple-700",
                            )}>
                                {account.type}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200">
                    {!account.isPosting && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => onAddChild(account.id)}
                            title="Add Sub-Account"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                        onClick={() => onEdit(account)}
                        title="Edit Account"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => onDelete(account.id)}
                        title="Delete Account"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="relative ml-6 pl-4 border-l-2 border-muted/50 mt-1">
                    {account.children!.map((child: AccountHierarchyNode) => (
                        <AccountNode
                            key={child.id}
                            account={child}
                            onEdit={onEdit}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface AccountTreeProps {
    data: AccountHierarchyNode[];
    onEdit: (account: AccountHierarchyNode) => void;
    onAddChild: (parentId: number) => void;
    onDelete: (id: number) => void;
}

export function AccountTree({ data, onEdit, onAddChild, onDelete }: AccountTreeProps) {
    return (
        <div className="space-y-1">
            {data.map((account) => (
                <AccountNode
                    key={account.id}
                    account={account}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                />
            ))}
            {data.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    No accounts found. Click &quot;Setup Default COA&quot; to begin.
                </div>
            )}
        </div>
    );
}
