'use server'

import { revalidatePath } from 'next/cache'
import * as settingsService from '@/lib/services/settings-service'
import * as fyService from '@/lib/services/fiscal-year-service'
import * as currencyService from '@/lib/services/currency-service'
import { redirect } from 'next/navigation'

// --- Company ---

export async function updateCompanyProfile(data: any) {
    // TODO: RBAC Check (Super Admin)
    await settingsService.updateCompanySettings(data)
    revalidatePath('/dashboard/settings/global')
}

// --- Fiscal Years ---

export async function createFiscalYear(data: any) {
    await fyService.createFiscalYear({
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
    })
    revalidatePath('/dashboard/settings/global')
}

export async function updateFiscalYear(id: number, data: any) {
    await fyService.updateFiscalYear(id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
    })
    revalidatePath('/dashboard/settings/global')
}

export async function activateFiscalYear(id: number) {
    await fyService.activateFiscalYear(id)
    revalidatePath('/dashboard/settings/global')
}

export async function lockFiscalYear(id: number) {
    await fyService.lockFiscalYear(id)
    revalidatePath('/dashboard/settings/global')
}

export async function deleteFiscalYear(id: number) {
    await fyService.deleteFiscalYear(id)
    revalidatePath('/dashboard/settings/global')
}

// --- Currencies ---

export async function createCurrency(data: any) {
    await currencyService.createCurrency({
        ...data,
        exchangeRate: Number(data.exchangeRate)
    })
    revalidatePath('/dashboard/settings/global')
}

export async function updateCurrency(id: number, data: any) {
    await currencyService.updateCurrency(id, {
        ...data,
        exchangeRate: data.exchangeRate ? Number(data.exchangeRate) : undefined
    })
    revalidatePath('/dashboard/settings/global')
}

export async function setBaseCurrency(id: number) {
    await currencyService.setBaseCurrency(id)
    revalidatePath('/dashboard/settings/global')
}

export async function deleteCurrency(id: number) {
    await currencyService.deleteCurrency(id)
    revalidatePath('/dashboard/settings/global')
}

// --- System Config ---

export async function updateSystemConfig(data: any) {
    await settingsService.updateSystemConfig({
        quantityDecimals: Number(data.quantityDecimals),
        amountDecimals: Number(data.amountDecimals),
        rateDecimals: Number(data.rateDecimals)
    })
    revalidatePath('/dashboard/settings/global')
}
