
import { Suspense } from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyForm } from "@/components/settings/company-form"
import { FiscalYearManager } from "@/components/settings/fiscal-year-manager"
import { CurrencyManager } from "@/components/settings/currency-manager"
import { PrecisionForm } from "@/components/settings/precision-form"
import { getCompanySettings, getSystemConfig } from "@/lib/services/settings-service"
import { getAllFiscalYears } from "@/lib/services/fiscal-year-service"
import { getAllCurrencies } from "@/lib/services/currency-service"

// Helper to remove nulls for serialization if needed, though Next.js handles simple objects well now.
// We'll trust the services return serializable data.

export const dynamic = 'force-dynamic'

export default async function GlobalSettingsPage() {
    const company = await getCompanySettings()
    const fiscalYears = await getAllFiscalYears()
    const currencies = await getAllCurrencies()
    const systemConfig = await getSystemConfig()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
                <p className="text-muted-foreground">
                    Manage system-wide configurations, company profile, and parameters.
                </p>
            </div>

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company">Company Profile</TabsTrigger>
                    <TabsTrigger value="fiscal-years">Fiscal Years</TabsTrigger>
                    <TabsTrigger value="currencies">Currencies</TabsTrigger>
                    <TabsTrigger value="precision">Precision & System</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>
                                This information will appear on invoices, reports, and official documents.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CompanyForm initialData={company || undefined} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fiscal-years" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fiscal Year Management</CardTitle>
                            <CardDescription>
                                Define and manage accounting periods. Only one period can be active at a time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FiscalYearManager fiscalYears={fiscalYears} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="currencies" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Currency Setup</CardTitle>
                            <CardDescription>
                                Manage operating currencies. The Base Currency is used for all accounting records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CurrencyManager currencies={currencies} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="precision" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Precision</CardTitle>
                            <CardDescription>
                                Control how many decimal places are stored and displayed for various values.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PrecisionForm initialData={systemConfig} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
