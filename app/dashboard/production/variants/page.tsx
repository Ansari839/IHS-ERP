import prisma from '@/lib/prisma'
import { VariantManagement } from '@/components/production/variant-management'

export const dynamic = 'force-dynamic'

export default async function VariantsPage() {
    let variants: any[] = []
    try {
        variants = await prisma.variant.findMany({
            include: {
                product: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error("Failed to fetch specifications:", error)
    }

    return <VariantManagement initialVariants={variants as any} />
}
