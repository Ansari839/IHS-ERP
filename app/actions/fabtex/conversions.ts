'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const conversionSchema = z.object({
    fromUnitId: z.coerce.number().min(1, "Source unit is required"),
    toUnitId: z.coerce.number().min(1, "Target unit is required"),
    conversionRate: z.coerce.number().min(0.000001, "Rate must be positive"),
});

export type ConversionState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getConversions() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        const conversions = await prisma.unitConversion.findMany({
            where: { companyId: company.id },
            include: {
                fromUnit: true,
                toUnit: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return conversions;
    } catch (error) {
        console.error("Error in getConversions:", error);
        return [];
    }
}

export async function createConversion(prevState: ConversionState, formData: FormData): Promise<ConversionState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const fromUnitId = formData.get('fromUnitId');
    const toUnitId = formData.get('toUnitId');
    const conversionRate = formData.get('conversionRate');

    const validated = conversionSchema.safeParse({ fromUnitId, toUnitId, conversionRate });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    if (validated.data.fromUnitId === validated.data.toUnitId) {
        return { success: false, error: "Source and Target units cannot be the same" };
    }

    try {
        // Check for existing
        const existing = await prisma.unitConversion.findUnique({
            where: {
                fromUnitId_toUnitId: {
                    fromUnitId: validated.data.fromUnitId,
                    toUnitId: validated.data.toUnitId
                }
            }
        });

        if (existing) {
            return { success: false, error: "This conversion rule already exists" };
        }

        await prisma.unitConversion.create({
            data: {
                fromUnitId: validated.data.fromUnitId,
                toUnitId: validated.data.toUnitId,
                conversionRate: validated.data.conversionRate,
                companyId: company.id
            }
        });

        revalidatePath('/dashboard/fab-tex/products/uom');
        return { success: true };
    } catch (error) {
        console.error('Create Conversion Error:', error);
        return { success: false, error: "Failed to create conversion" };
    }
}

export async function deleteConversion(id: number): Promise<ConversionState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.unitConversion.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/uom');
        return { success: true };
    } catch (error) {
        console.error('Delete Conversion Error:', error);
        return { success: false, error: "Failed to delete conversion" };
    }
}
