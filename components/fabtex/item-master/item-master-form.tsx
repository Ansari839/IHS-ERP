"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Upload, X } from "lucide-react";
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
    FormDescription,
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
import { createItemMaster, updateItemMaster } from "@/app/actions/fabtex/item-master";
import Image from "next/image";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    shortDescription: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    hsCode: z.string().optional(),
    itemGroupId: z.string().min(1, "Item Group is required"),
    baseUnitId: z.string().min(1, "Base Unit is required"), // Form uses string, we coerce to number in action
    packingUnitId: z.string().optional(),
    imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemMasterFormProps {
    mode?: "create" | "edit";
    defaultValues?: any;
    itemGroups: any[];
    units: any[];
    packingUnits: any[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    segment?: string;
}

export function ItemMasterForm({
    mode = "create",
    defaultValues,
    itemGroups,
    units,
    packingUnits,
    open: externalOpen,
    onOpenChange: setExternalOpen,
    segment = "YARN",
}: ItemMasterFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.imageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const open = externalOpen ?? internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: (defaultValues?.name as string) || "",
            shortDescription: (defaultValues?.shortDescription as string) || undefined,
            status: (defaultValues?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
            hsCode: (defaultValues?.hsCode as string) || undefined,
            itemGroupId: (defaultValues?.itemGroupId as string) || "",
            baseUnitId: (defaultValues?.baseUnitId?.toString() as string) || "",
            packingUnitId: (defaultValues?.packingUnitId as string) || undefined,
            imageUrl: (defaultValues?.imageUrl as string) || undefined,
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        form.setValue("imageUrl", ""); // Clear URL if one existed
    };

    async function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("segment", segment);
        if (values.shortDescription) formData.append("shortDescription", values.shortDescription);
        formData.append("status", values.status);
        if (values.hsCode) formData.append("hsCode", values.hsCode);
        formData.append("itemGroupId", values.itemGroupId);
        formData.append("baseUnitId", values.baseUnitId);
        if (values.packingUnitId) formData.append("packingUnitId", values.packingUnitId);
        if (values.imageUrl) formData.append("imageUrl", values.imageUrl); // Preserve existing URL if not changed

        if (fileInputRef.current?.files?.[0]) {
            formData.append("imageFile", fileInputRef.current.files[0]);
        }

        startTransition(async () => {
            const result = mode === "create"
                ? await createItemMaster({ success: false }, formData)
                : await updateItemMaster(defaultValues.id, { success: false }, formData);

            if (result.success) {
                toast.success(`Item ${mode === "create" ? "created" : "updated"} successfully`);
                setOpen(false);
                if (mode === "create") {
                    form.reset();
                    setImagePreview(null);
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
                        Add Item
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Item" : "Edit Item"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Image Upload Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 border-2 border-dashed rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <div className="absolute top-1 right-1">
                                            <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={removeImage}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground text-xs">
                                        <Upload className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                        <span>Click to upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Cotton Yarn" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="itemGroupId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Group</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Group" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {itemGroups.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="baseUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((u) => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>{u.name} ({u.symbol})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="packingUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packing Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Packing" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {packingUnits.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hsCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>HS Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} disabled={isPending} />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
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
                        </div>

                        <FormField
                            control={form.control}
                            name="shortDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Short Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Optional details..." className="resize-none" {...field} disabled={isPending} />
                                    </FormControl>
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
                                {mode === "create" ? "Create Item" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}
