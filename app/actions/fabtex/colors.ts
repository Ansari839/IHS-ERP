'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const colorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type ColorState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getColors() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        if (!(prisma as any).color) {
            console.error("Prisma color model is missing from client!");
            return [];
        }

        const colors = await prisma.color.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });
        return colors;
    } catch (error) {
        console.error("Error in getColors:", error);
        return [];
    }
}

export async function createColor(prevState: ColorState, formData: FormData): Promise<ColorState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Resolve Company
    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    // Validate Form
    const name = formData.get('name') as string;
    const pictureFile = formData.get('picture') as File | null;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = colorSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Handle Picture Upload
        let pictureUrl: string | undefined = undefined;
        if (pictureFile && pictureFile.size > 0) {
            try {
                const { uploadToCloudinary } = await import('@/lib/cloudinary');
                pictureUrl = await uploadToCloudinary(pictureFile, "colors");
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                return { success: false, error: 'Failed to upload color image' };
            }
        }

        // Auto-Generate Code
        // Format: COL-0001
        console.log('🔍 Fetching last color for company:', company.id);
        const lastColor = await prisma.color.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        console.log('📊 Last color found:', lastColor);

        let nextNumber = 1;
        if (lastColor && lastColor.code) {
            console.log('📝 Last color code:', lastColor.code);
            if (lastColor.code.startsWith('COL-')) {
                const codeNumber = lastColor.code.replace('COL-', '');
                console.log('🔢 Extracted code number:', codeNumber);
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        console.log('➡️  Next number:', nextNumber);
        const code = `COL-${String(nextNumber).padStart(4, '0')}`;
        console.log('✅ Generated code:', code);

        console.log('💾 Creating color with data:', {
            code,
            name: validated.data.name,
            pictureUrl,
            status: validated.data.status,
            companyId: company.id
        });

        await prisma.color.create({
            data: {
                code,
                name: validated.data.name,
                pictureUrl,
                status: validated.data.status,
                companyId: company.id
            }
        });

        console.log('✅ Color created successfully');
        revalidatePath('/dashboard/fab-tex/products/colors');
        return { success: true };
    } catch (error) {
        console.error('❌ Create Color Error:', error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create color" };
    }
}

export async function updateColor(id: string, prevState: ColorState, formData: FormData): Promise<ColorState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const pictureFile = formData.get('picture') as File | null;
    const removeImage = formData.get('removeImage') === 'true';
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = colorSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        let pictureUrl: string | undefined = undefined;
        if (pictureFile && pictureFile.size > 0) {
            try {
                const { uploadToCloudinary } = await import('@/lib/cloudinary');
                pictureUrl = await uploadToCloudinary(pictureFile, "colors");
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                return { success: false, error: 'Failed to upload color image' };
            }
        }

        await prisma.color.update({
            where: { id },
            data: {
                name: validated.data.name,
                ...(pictureUrl && { pictureUrl }),
                ...(removeImage && { pictureUrl: null }),
                status: validated.data.status,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/colors');
        return { success: true };
    } catch (error) {
        console.error('Update Color Error:', error);
        return { success: false, error: "Failed to update color" };
    }
}

export async function deleteColor(id: string): Promise<ColorState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.color.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/colors');
        return { success: true };
    } catch (error) {
        console.error('Delete Color Error:', error);
        return { success: false, error: "Failed to delete color" };
    }
}
