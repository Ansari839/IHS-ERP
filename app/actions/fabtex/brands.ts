'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const brandSchema = z.object({
    name: z.string().min(1, "Name is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type BrandState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getBrands() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        // Safety check for dynamic Prisma client generation
        if (!(prisma as any).brand) {
            console.error("Prisma brand model is missing from client!");
            return [];
        }

        const brands = await prisma.brand.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });
        return brands;
    } catch (error) {
        console.error("Error in getBrands:", error);
        return [];
    }
}

export async function createBrand(prevState: BrandState, formData: FormData): Promise<BrandState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const name = formData.get('name') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = brandSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code: BRD-0001
        const lastBrand = await prisma.brand.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastBrand && lastBrand.code) {
            if (lastBrand.code.startsWith('BRD-')) {
                const codeNumber = lastBrand.code.replace('BRD-', '');
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const code = `BRD-${String(nextNumber).padStart(4, '0')}`;

        await prisma.brand.create({
            data: {
                code,
                name: validated.data.name,
                status: validated.data.status,
                companyId: company.id
            }
        });

        revalidatePath('/dashboard/fab-tex/products/brand');
        return { success: true };
    } catch (error) {
        console.error('Create Brand Error:', error);
        return { success: false, error: "Failed to create brand" };
    }
}

export async function updateBrand(id: string, prevState: BrandState, formData: FormData): Promise<BrandState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = brandSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.brand.update({
            where: { id },
            data: {
                name: validated.data.name,
                status: validated.data.status,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/brand');
        return { success: true };
    } catch (error) {
        console.error('Update Brand Error:', error);
        return { success: false, error: "Failed to update brand" };
    }
}

export async function deleteBrand(id: string): Promise<BrandState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.brand.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/brand');
        return { success: true };
    } catch (error) {
        console.error('Delete Brand Error:', error);
        return { success: false, error: "Failed to delete brand" };
    }
}
