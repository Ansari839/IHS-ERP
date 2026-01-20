"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, ArrowRight } from "lucide-react";
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
import { createConversion } from "@/app/actions/fabtex/conversions";
import { Uom } from "../uom/uom-columns";

const formSchema = z.object({
    fromUnitId: z.string().min(1, "Required"),
    toUnitId: z.string().min(1, "Required"),
    conversionRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be positive number"),
});

type FormValues = z.infer<typeof formSchema>;

interface ConversionFormProps {
    units: Uom[];
}

export function ConversionForm({ units }: ConversionFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromUnitId: "",
            toUnitId: "",
            conversionRate: "1",
        },
    });

    async function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append("fromUnitId", values.fromUnitId);
        formData.append("toUnitId", values.toUnitId);
        formData.append("conversionRate", values.conversionRate);

        startTransition(async () => {
            const result = await createConversion({ success: false }, formData);

            if (result.success) {
                toast.success("Conversion rule created");
                setOpen(false);
                form.reset();
                router.refresh();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Conversion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Conversion Rule</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-end gap-2">
                            <FormField
                                control={form.control}
                                name="fromUnitId"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>1 Unit of</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((u) => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.name} ({u.symbol})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pb-3 text-muted-foreground">=</div>

                            <FormField
                                control={form.control}
                                name="conversionRate"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Rate</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.0001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                        </div>

                        <FormField
                            control={form.control}
                            name="toUnitId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equivalent in</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select target unit..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {units.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.name} ({u.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Rule
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
