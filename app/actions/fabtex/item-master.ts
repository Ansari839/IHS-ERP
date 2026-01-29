'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const itemMasterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    shortDescription: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    hsCode: z.string().optional(),
    itemGroupId: z.string().min(1, "Item Group is required"),
    baseUnitId: z.coerce.number().min(1, "Base Unit is required"),
    packingUnitId: z.string().optional().nullable(),
    imageUrl: z.string().optional(),
});

export type ItemMasterState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getItemMasters(segment?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        if (!(prisma as any).itemMaster) {
            console.error("Prisma itemMaster model is missing from client!");
            return [];
        }

        const items = await prisma.itemMaster.findMany({
            where: {
                companyId: company.id,
                ...(segment && { segment: segment as any })
            },
            include: {
                itemGroup: true,
                baseUnit: true,
                packingUnit: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return items;
    } catch (error) {
        console.error("Error in getItemMasters:", error);
        return [];
    }
}

export async function createItemMaster(prevState: ItemMasterState, formData: FormData): Promise<ItemMasterState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const name = formData.get('name') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";
    const hsCode = formData.get('hsCode') as string;
    const itemGroupId = formData.get('itemGroupId') as string;
    const baseUnitId = formData.get('baseUnitId');
    const packingUnitId = formData.get('packingUnitId') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Check if image file exists and upload if it does (for simplicity, we assume Client handles upload or we just save URL for now if using existing upload logic)
    // However, looking at previous patterns, we usually upload on server here if FormData has file.
    // For now, let's assume the form passes the uploaded Image URL string (from client) OR we implement server upload.
    // Let's stick to the pattern used in Color: uploading is done via server action if file is sent.

    let finalImageUrl = imageUrl || "";

    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile && imageFile.size > 0) {
        try {
            // Use the shared helper function
            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            finalImageUrl = await uploadToCloudinary(imageFile, 'fab-tex/items');
        } catch (error) {
            console.error("Image upload failed:", error);
            return { success: false, error: "Image upload failed" };
        }
    }


    const validated = itemMasterSchema.safeParse({
        name, shortDescription, status, hsCode, itemGroupId, baseUnitId, packingUnitId, imageUrl: finalImageUrl
    });

    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code: ITM-0001
        const lastItem = await prisma.itemMaster.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastItem && lastItem.code) {
            if (lastItem.code.startsWith('ITM-')) {
                const codeNumber = lastItem.code.replace('ITM-', '');
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const code = `ITM-${String(nextNumber).padStart(4, '0')}`;

        await prisma.itemMaster.create({
            data: {
                code,
                name: validated.data.name,
                shortDescription: validated.data.shortDescription,
                status: validated.data.status,
                hsCode: validated.data.hsCode,
                imageUrl: validated.data.imageUrl,
                itemGroupId: validated.data.itemGroupId,
                baseUnitId: validated.data.baseUnitId,
                packingUnitId: validated.data.packingUnitId || null,
                companyId: company.id,
                segment: (formData.get('segment') as any) || 'GENERAL'
            }
        });

        revalidatePath('/dashboard/fab-tex/products/item-master');
        return { success: true };
    } catch (error) {
        console.error('Create ItemMaster Error:', error);
        return { success: false, error: "Failed to create Item Master" };
    }
}

export async function updateItemMaster(id: string, prevState: ItemMasterState, formData: FormData): Promise<ItemMasterState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";
    const hsCode = formData.get('hsCode') as string;
    const itemGroupId = formData.get('itemGroupId') as string;
    const baseUnitId = formData.get('baseUnitId');
    const packingUnitId = formData.get('packingUnitId') as string;
    let imageUrl = formData.get('imageUrl') as string;

    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile && imageFile.size > 0) {
        try {
            // Use the shared helper function
            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            imageUrl = await uploadToCloudinary(imageFile, 'fab-tex/items');
        } catch (error) {
            console.error("Image upload failed:", error);
            return { success: false, error: "Image upload failed" };
        }
    }

    const validated = itemMasterSchema.safeParse({
        name, shortDescription, status, hsCode, itemGroupId, baseUnitId, packingUnitId, imageUrl
    });

    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.itemMaster.update({
            where: { id },
            data: {
                name: validated.data.name,
                shortDescription: validated.data.shortDescription,
                status: validated.data.status,
                hsCode: validated.data.hsCode,
                imageUrl: validated.data.imageUrl,
                itemGroupId: validated.data.itemGroupId,
                baseUnitId: validated.data.baseUnitId,
                packingUnitId: validated.data.packingUnitId || null,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/item-master');
        return { success: true };
    } catch (error) {
        console.error('Update ItemMaster Error:', error);
        return { success: false, error: "Failed to update Item Master" };
    }
}

export async function deleteItemMaster(id: string): Promise<ItemMasterState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.itemMaster.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/item-master');
        return { success: true };
    } catch (error) {
        console.error('Delete ItemMaster Error:', error);
        return { success: false, error: "Failed to delete Item Master" };
    }
}
