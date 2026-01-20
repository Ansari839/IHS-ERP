'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const uomSchema = z.object({
    name: z.string().min(1, "Name is required"),
    symbol: z.string().min(1, "Symbol is required"),
    unitType: z.enum(["WEIGHT", "LENGTH", "COUNT", "VOLUME", "AREA", "TIME"]),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type UomState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getUoms() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const company = await prisma.company.findFirst();
        if (!company) return [];

        // Safety check for dynamic Prisma client generation
        if (!(prisma as any).unit) {
            console.error("Prisma unit model is missing from client!");
            return [];
        }

        const uoms = await prisma.unit.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });
        return uoms;
    } catch (error) {
        console.error("Error in getUoms:", error);
        return [];
    }
}

export async function createUom(prevState: UomState, formData: FormData): Promise<UomState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const unitType = formData.get('unitType') as any;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = uomSchema.safeParse({ name, symbol, unitType, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code: UOM-0001
        const lastUom = await prisma.unit.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastUom && lastUom.code) {
            if (lastUom.code.startsWith('UOM-')) {
                const codeNumber = lastUom.code.replace('UOM-', '');
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const code = `UOM-${String(nextNumber).padStart(4, '0')}`;

        await prisma.unit.create({
            data: {
                code,
                name: validated.data.name,
                symbol: validated.data.symbol,
                unitType: validated.data.unitType,
                status: validated.data.status,
                companyId: company.id
            }
        });

        revalidatePath('/dashboard/fab-tex/products/uom');
        return { success: true };
    } catch (error) {
        console.error('Create UOM Error:', error);
        return { success: false, error: "Failed to create UOM" };
    }
}

export async function updateUom(id: number, prevState: UomState, formData: FormData): Promise<UomState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const unitType = formData.get('unitType') as any;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = uomSchema.safeParse({ name, symbol, unitType, status });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.unit.update({
            where: { id },
            data: {
                name: validated.data.name,
                symbol: validated.data.symbol,
                unitType: validated.data.unitType,
                status: validated.data.status,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/uom');
        return { success: true };
    } catch (error) {
        console.error('Update UOM Error:', error);
        return { success: false, error: "Failed to update UOM" };
    }
}

export async function deleteUom(id: number): Promise<UomState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.unit.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/uom');
        return { success: true };
    } catch (error) {
        console.error('Delete UOM Error:', error);
        return { success: false, error: "Failed to delete UOM" };
    }
}
