'use client';

import { useState, useTransition, useEffect } from "react"; // Added useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createItemGroup, updateItemGroup } from "@/app/actions/fabtex/item-groups";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    parentId: z.string().optional().nullable(), // Changed to string/null
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

interface ItemGroupFormProps {
    mode: "create" | "edit";
    defaultValues?: any;
    existingGroups?: any[];
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ItemGroupForm({ mode, defaultValues, existingGroups = [], trigger, open, onOpenChange }: ItemGroupFormProps) {
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Determine actual open state control
    // If props are provided, use them (controlled), else use internal state
    const isOpen = open !== undefined ? open : isInternalOpen;
    const setOpen = onOpenChange || setIsInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            description: defaultValues?.description || undefined,
            parentId: defaultValues?.parentId || "null", // Use "null" string for Select value
            status: defaultValues?.status || "ACTIVE",
        },
    });

    // Reset form when defaultValues change (crucial for edit mode)
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: defaultValues.name || "",
                description: defaultValues.description || undefined,
                parentId: defaultValues.parentId || "null",
                status: defaultValues.status || "ACTIVE",
            });
        }
    }, [defaultValues, form]);


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.description) formData.append("description", values.description);
        formData.append("status", values.status);

        // Handle "null" string from Select
        if (values.parentId && values.parentId !== "null") {
            formData.append("parentId", values.parentId);
        } else {
            formData.append("parentId", "null");
        }

        startTransition(async () => {
            let result;
            if (mode === "create") {
                // We pass a dummy state object as first arg because of useFormState signature in action
                result = await createItemGroup({ success: false }, formData);
            } else {
                result = await updateItemGroup(defaultValues.id, { success: false }, formData);
            }

            if (result.success) {
                toast.success(mode === "create" ? "Item Group created" : "Item Group updated");
                setOpen(false);
                if (mode === 'create') form.reset();
            } else {
                toast.error(result.error);
            }
        });
    };

    // Filter out self from potential parents in edit mode
    const potentialParents = existingGroups.filter(g =>
        mode === 'create' || g.id !== defaultValues?.id
    );

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Item Group" : "Edit Item Group"}</DialogTitle>
                    <DialogDescription>
                        {mode === "create" ? "Add a new group for item categorization." : "Update item group details."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Yarns" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Group</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || "null"}
                                        value={field.value || "null"} // Ensure controlled value
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent (Optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="null">None (Root)</SelectItem>
                                            {potentialParents.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>
                                                    {group.name}
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Optional details..."
                                            {...field}
                                            value={field.value || ""}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "create" ? "Create" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
