'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const itemGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().nullish(),
    parentId: z.string().nullish(),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type ItemGroupState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function getItemGroups() {
    const user = await getCurrentUser();
    if (!user) return [];

    // Validating user permissions or existence is enough here

    // Assuming user is linked to a company, though the schema only links User -> Department -> ? 
    // In our simplified logic we need to find the company. 
    // For now, let's fetch the first company if user doesn't have a specific link, or use the one linked to their department if applicable.
    // However, the schema shows Company has `itemGroups`. 
    // Let's assume operation is on the first company for this single-tenant-like MVP or derived from context.

    // In strict multi-tenant:
    // const companyId = user.companyId // (If added to User model)
    const company = await prisma.company.findFirst();
    if (!company) return [];

    const groups = await prisma.itemGroup.findMany({
        where: { companyId: company.id },
        include: {
            parent: {
                select: { name: true }
            },
            _count: {
                select: { children: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return groups;
}

export async function createItemGroup(prevState: ItemGroupState, formData: FormData): Promise<ItemGroupState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Resolve Company
    const company = await prisma.company.findFirst();
    if (!company) return { success: false, error: "No company defined" };

    // Validate Form
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const parentId = formData.get('parentId') as string | null;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = itemGroupSchema.safeParse({
        name,
        description: description || null,
        parentId: parentId === "null" ? null : parentId,
        status
    });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        // Auto-Generate Code
        // Format: GRP-0001
        console.log('🔍 Fetching last item group for company:', company.id);
        const lastGroup = await prisma.itemGroup.findFirst({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' }
        });

        console.log('📊 Last group found:', lastGroup);

        let nextNumber = 1;
        if (lastGroup && lastGroup.code) {
            console.log('📝 Last group code:', lastGroup.code);
            if (lastGroup.code.startsWith('GRP-')) {
                const codeNumber = lastGroup.code.replace('GRP-', '');
                console.log('🔢 Extracted code number:', codeNumber);
                const lastNum = parseInt(codeNumber, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        console.log('➡️  Next number:', nextNumber);
        const code = `GRP-${String(nextNumber).padStart(4, '0')}`;
        console.log('✅ Generated code:', code);

        console.log('💾 Creating item group with data:', {
            code,
            name: validated.data.name,
            description: validated.data.description,
            status: validated.data.status,
            parentId: validated.data.parentId || null,
            companyId: company.id
        });

        await prisma.itemGroup.create({
            data: {
                code,
                name: validated.data.name,
                description: validated.data.description,
                status: validated.data.status,
                parentId: validated.data.parentId || null,
                companyId: company.id
            }
        });

        console.log('✅ Item group created successfully');
        revalidatePath('/dashboard/fab-tex/products/item-group');
        return { success: true };
    } catch (error) {
        console.error('❌ Create Item Group Error:', error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create item group" };
    }
}

export async function updateItemGroup(id: string, prevState: ItemGroupState, formData: FormData): Promise<ItemGroupState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const parentId = formData.get('parentId') as string | null;
    const status = formData.get('status') as "ACTIVE" | "INACTIVE" || "ACTIVE";

    const validated = itemGroupSchema.safeParse({
        name,
        description: description || null,
        parentId: parentId === "null" ? null : parentId,
        status
    });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    // Cycle check: Can't be your own parent
    if (parentId === id) {
        return { success: false, error: "Cannot set parent to itself" };
    }

    // Deep cycle checking could be added if needed, but for now simple check.

    try {
        await prisma.itemGroup.update({
            where: { id },
            data: {
                name: validated.data.name,
                description: validated.data.description,
                status: validated.data.status,
                parentId: validated.data.parentId || null,
            }
        });
        revalidatePath('/dashboard/fab-tex/products/item-group');
        return { success: true };
    } catch (error) {
        console.error('Update Item Group Error:', error);
        return { success: false, error: "Failed to update item group" };
    }
}

export async function deleteItemGroup(id: string): Promise<ItemGroupState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        // Check for children
        const childrenCount = await prisma.itemGroup.count({ where: { parentId: id } });
        if (childrenCount > 0) {
            return { success: false, error: "Cannot delete group with children. Move or delete children first." };
        }

        await prisma.itemGroup.delete({ where: { id } });
        revalidatePath('/dashboard/fab-tex/products/item-group');
        return { success: true };
    } catch (error) {
        console.error('Delete Item Group Error:', error);
        return { success: false, error: "Failed to delete item group" };
    }
}
