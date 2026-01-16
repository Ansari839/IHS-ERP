import prisma from '@/lib/prisma'
import { MachineManagement } from '@/components/production/in-house/machine-management'

export const dynamic = 'force-dynamic'

export default async function MachinesPage() {
    let machines: any[] = []
    try {
        machines = await prisma.machine.findMany({
            include: {
                location: true
            },
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch machines:", error)
    }

    return <MachineManagement initialMachines={machines} />
}
