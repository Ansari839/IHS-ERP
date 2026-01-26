"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPackingUnit, updatePackingUnit } from "@/app/actions/fabtex/packing-unit";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    symbol: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof formSchema>;

interface PackingUnitFormProps {
    mode?: "create" | "edit";
    defaultValues?: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function PackingUnitForm({
    mode = "create",
    defaultValues,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: PackingUnitFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const open = externalOpen ?? internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: (defaultValues?.name as string) || "",
            symbol: (defaultValues?.symbol as string) || "",
            status: (defaultValues?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
        },
    });

    async function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.symbol) formData.append("symbol", values.symbol);
        formData.append("status", values.status);

        startTransition(async () => {
            const result = mode === "create"
                ? await createPackingUnit({ success: false }, formData)
                : await updatePackingUnit(defaultValues.id, { success: false }, formData);

            if (result.success) {
                toast.success(`Packing Unit ${mode === "create" ? "created" : "updated"} successfully`);
                setOpen(false);
                if (mode === "create") {
                    form.reset();
                }
                router.refresh();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {mode === "create" && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Packing Unit
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Packing Unit" : "Edit Packing Unit"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter packing unit name (e.g. Bales, Rolls)" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter symbol (e.g. BL, CTN)" {...field} disabled={isPending} />
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
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
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

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "create" ? "Create Packing Unit" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
