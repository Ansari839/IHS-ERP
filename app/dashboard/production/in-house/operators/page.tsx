import prisma from '@/lib/prisma'
import { OperatorManagement } from '@/components/production/in-house/operator-management'

export const dynamic = 'force-dynamic'

export default async function OperatorsPage() {
    let operators: any[] = []
    try {
        operators = await prisma.operator.findMany({
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch operators:", error)
    }

    return <OperatorManagement initialOperators={operators} />
}
