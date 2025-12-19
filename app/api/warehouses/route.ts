import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // If admin, return all. If user, return assigned.
        // For now, let's assume 'read:settings' or 'read:warehouses' allows viewing all
        // We will refine this with the "User-Warehouse Assignment" step

        const warehouses = await prisma.warehouse.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(warehouses)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || !hasPermission(user, 'create:settings')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { name, location, status } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const warehouse = await prisma.warehouse.create({
            data: { name, location, status }
        })

        return NextResponse.json(warehouse)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
