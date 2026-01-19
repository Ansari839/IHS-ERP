"use client";

import { useState, useTransition } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createColor, updateColor } from "@/app/actions/fabtex/colors";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
    mode?: "create" | "edit";
    defaultValues?: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ColorForm({
    mode = "create",
    defaultValues,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: ColorFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValues?.pictureUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const router = useRouter();

    const open = externalOpen ?? internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: (defaultValues?.name as string) || "",
            status: (defaultValues?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageRemoved(false);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageRemoved(true);
    };

    async function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("status", values.status);

        if (selectedFile) {
            formData.append("picture", selectedFile);
        }

        if (imageRemoved) {
            formData.append("removeImage", "true");
        }

        startTransition(async () => {
            const result = mode === "create"
                ? await createColor({ success: false }, formData)
                : await updateColor(defaultValues.id, { success: false }, formData);

            if (result.success) {
                toast.success(`Color ${mode === "create" ? "created" : "updated"} successfully`);
                setOpen(false);
                if (mode === "create") {
                    form.reset();
                    removeImage();
                    setImageRemoved(false);
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
                        Add Color
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Color" : "Edit Color"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter color name" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Color Picture (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    {previewUrl ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="h-24 w-24 rounded-lg object-cover border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={removeImage}
                                                disabled={isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        <span className="font-semibold">Click to upload</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        PNG, JPG or WEBP (MAX. 800x400px)
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    disabled={isPending}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

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
                                {mode === "create" ? "Create Color" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
