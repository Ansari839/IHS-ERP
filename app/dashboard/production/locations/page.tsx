import prisma from '@/lib/prisma'
import { LocationManagement } from '@/components/production/location-management'

export const dynamic = 'force-dynamic'

export default async function LocationsPage() {
    let locations: any[] = []
    try {
        locations = await prisma.location.findMany({
            orderBy: { name: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch locations:", error)
        // Fallback to empty if DB is not reachable
    }

    return <LocationManagement initialLocations={locations} />
}
