'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const itemGradeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type ItemGradeState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getItemGrades() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        // Safety check
        if (!(prisma as any).itemGrade) {
            console.error("Prisma itemGrade model is missing from client!");
            return [];
        }

        const grades = await prisma.itemGrade.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });
        return grades;
    } catch (error) {
        console.error("Error in getItemGrades:", error);
        return [];
    }
}

export async function createItemGrade(prevState: ItemGradeState, formData: FormData): Promise<ItemGradeState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const name = formData.get('name') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = itemGradeSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code: GRD-0001
        const lastGrade = await prisma.itemGrade.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastGrade && lastGrade.code) {
            if (lastGrade.code.startsWith('GRD-')) {
                const codeNumber = lastGrade.code.replace('GRD-', '');
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const code = `GRD-${String(nextNumber).padStart(4, '0')}`;

        await prisma.itemGrade.create({
            data: {
                code,
                name: validated.data.name,
                status: validated.data.status,
                companyId: company.id
            }
        });

        revalidatePath('/dashboard/fab-tex/products/item-grade');
        return { success: true };
    } catch (error) {
        console.error('Create ItemGrade Error:', error);
        return { success: false, error: "Failed to create Item Grade" };
    }
}

export async function updateItemGrade(id: string, prevState: ItemGradeState, formData: FormData): Promise<ItemGradeState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = itemGradeSchema.safeParse({ name, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.itemGrade.update({
            where: { id },
            data: {
                name: validated.data.name,
                status: validated.data.status,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/item-grade');
        return { success: true };
    } catch (error) {
        console.error('Update ItemGrade Error:', error);
        return { success: false, error: "Failed to update Item Grade" };
    }
}

export async function deleteItemGrade(id: string): Promise<ItemGradeState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.itemGrade.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/item-grade');
        return { success: true };
    } catch (error) {
        console.error('Delete ItemGrade Error:', error);
        return { success: false, error: "Failed to delete Item Grade" };
    }
}
