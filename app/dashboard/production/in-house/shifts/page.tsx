import prisma from '@/lib/prisma'
import { ShiftManagement } from '@/components/production/in-house/shift-management'

export const dynamic = 'force-dynamic'

export default async function ShiftsPage() {
    let shifts: any[] = []
    try {
        shifts = await prisma.shift.findMany({
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch shifts:", error)
    }

    return <ShiftManagement initialShifts={shifts} />
}
