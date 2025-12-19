import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

interface Params {
    params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user || !hasPermission(user, 'update:settings')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const warehouseId = parseInt(id)
        const body = await req.json()

        const warehouse = await prisma.warehouse.update({
            where: { id: warehouseId },
            data: body
        })

        return NextResponse.json(warehouse)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user || !hasPermission(user, 'delete:settings')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const warehouseId = parseInt(id)

        await prisma.warehouse.delete({
            where: { id: warehouseId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
