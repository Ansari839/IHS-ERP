'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const packingUnitSchema = z.object({
    name: z.string().min(1, "Name is required"),
    symbol: z.string().optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type PackingUnitState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getPackingUnits() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        const packingUnits = await prisma.packingUnit.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });
        return packingUnits;
    } catch (error) {
        console.error("Error in getPackingUnits:", error);
        return [];
    }
}

export async function createPackingUnit(prevState: PackingUnitState, formData: FormData): Promise<PackingUnitState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = packingUnitSchema.safeParse({ name, symbol, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code: PKU-0001
        const lastPKU = await prisma.packingUnit.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastPKU && lastPKU.code && lastPKU.code.startsWith('PKU-')) {
            const lastNum = parseInt(lastPKU.code.replace('PKU-', ''), 10);
            if (!isNaN(lastNum)) {
                nextNumber = lastNum + 1;
            }
        }

        const code = `PKU-${String(nextNumber).padStart(4, '0')}`;

        await prisma.packingUnit.create({
            data: {
                code,
                name: validated.data.name,
                symbol: validated.data.symbol,
                status: validated.data.status,
                companyId: company.id
            }
        });

        revalidatePath('/dashboard/fab-tex/products/item-packing');
        return { success: true };
    } catch (error) {
        console.error('Create Packing Unit Error:', error);
        return { success: false, error: "Failed to create packing unit" };
    }
}

export async function updatePackingUnit(id: string, prevState: PackingUnitState, formData: FormData): Promise<PackingUnitState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = packingUnitSchema.safeParse({ name, symbol, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.packingUnit.update({
            where: { id },
            data: {
                name: validated.data.name,
                symbol: validated.data.symbol,
                status: validated.data.status,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/item-packing');
        return { success: true };
    } catch (error) {
        console.error('Update Packing Unit Error:', error);
        return { success: false, error: "Failed to update packing unit" };
    }
}

export async function deletePackingUnit(id: string): Promise<PackingUnitState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.packingUnit.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/item-packing');
        return { success: true };
    } catch (error) {
        console.error('Delete Packing Unit Error:', error);
        return { success: false, error: "Failed to delete packing unit" };
    }
}
