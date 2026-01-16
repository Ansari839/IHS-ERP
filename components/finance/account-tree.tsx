
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
        <div className="ml-4">
            <div className="flex items-center py-1 px-2 hover:bg-muted/50 rounded-md group transition-colors">
                <div className="w-6 h-6 flex items-center justify-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    {hasChildren ? (
                        isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : null}
                </div>

                <div className="flex items-center flex-1 space-x-2">
                    {account.isPosting ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                        <Folder className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-sm font-medium">
                        <span className="text-muted-foreground mr-2 font-mono">{account.code}</span>
                        {account.name}
                    </span>
                    <span className={cn(
                        "text-[10px] px-1.5 rounded-full border",
                        account.type === "ASSET" && "border-green-200 bg-green-50 text-green-700",
                        account.type === "LIABILITY" && "border-red-200 bg-red-50 text-red-700",
                        account.type === "EXPENSE" && "border-orange-200 bg-orange-50 text-orange-700",
                        account.type === "INCOME" && "border-blue-200 bg-blue-50 text-blue-700",
                        account.type === "EQUITY" && "border-purple-200 bg-purple-50 text-purple-700",
                    )}>
                        {account.type}
                    </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                    {!account.isPosting && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddChild(account.id)}>
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(account)}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(account.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="border-l border-muted ml-3 mt-1 pl-1">
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
