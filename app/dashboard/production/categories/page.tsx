import prisma from '@/lib/prisma'
import { CategoryManagement } from '@/components/production/category-management'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    let categories: any[] = []
    try {
        categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback to empty if DB is not reachable
    }

    return <CategoryManagement initialCategories={categories} />
}
