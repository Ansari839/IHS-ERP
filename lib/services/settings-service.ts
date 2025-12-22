import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- Company Settings ---

export async function getCompanySettings() {
    const company = await prisma.company.findFirst()
    return company
}

export async function updateCompanySettings(data: {
    legalName: string
    tradeName?: string
    address?: string
    country?: string
    phone?: string
    email?: string
    taxId?: string
    logoUrl?: string
}) {
    const existing = await prisma.company.findFirst()

    if (existing) {
        return await prisma.company.update({
            where: { id: existing.id },
            data,
        })
    } else {
        return await prisma.company.create({
            data: {
                ...data,
                tradeName: data.tradeName || null,
                address: data.address || null,
                country: data.country || null,
                phone: data.phone || null,
                email: data.email || null,
                taxId: data.taxId || null,
                logoUrl: data.logoUrl || null,
            }
        })
    }
}

// --- System Configuration (Precision) ---

export async function getSystemConfig() {
    const config = await prisma.systemConfig.findFirst()
    if (!config) {
        // Create default if not exists
        return await prisma.systemConfig.create({
            data: {
                quantityDecimals: 2,
                amountDecimals: 2,
                rateDecimals: 4
            }
        })
    }
    return config
}

export async function updateSystemConfig(data: {
    quantityDecimals: number
    amountDecimals: number
    rateDecimals: number
}) {
    const existing = await prisma.systemConfig.findFirst()

    if (existing) {
        return await prisma.systemConfig.update({
            where: { id: existing.id },
            data
        })
    } else {
        return await prisma.systemConfig.create({ data })
    }
}

// --- System Settings (Feature Flags / Key-Value) ---

export async function getSystemSetting(key: string) {
    const setting = await prisma.systemSetting.findUnique({
        where: { key }
    })
    return setting?.value || null
}

export async function updateSystemSetting(key: string, value: string, description?: string) {
    return await prisma.systemSetting.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
    })
}
