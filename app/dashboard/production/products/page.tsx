import prisma from '@/lib/prisma'
import { ProductManagement } from '@/components/production/product-management'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
    let products: any[] = []
    try {
        products = await prisma.product.findMany({
            include: {
                category: { select: { name: true } },
                unit: { select: { name: true } },
                _count: { select: { variants: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error("Failed to fetch products:", error)
    }

    return <ProductManagement initialProducts={products as any} />
}
