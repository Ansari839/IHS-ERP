import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const machines = await prisma.machine.findMany({
            include: {
                location: true
            },
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(machines)
    } catch (error) {
        console.error("Failed to fetch machines:", error)
        return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, code, type, status, locationId } = body

        if (!name || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const machine = await prisma.machine.create({
            data: {
                name,
                code,
                type,
                status: status || "ACTIVE",
                locationId: locationId ? parseInt(locationId) : null
            },
            include: {
                location: true
            }
        })

        return NextResponse.json(machine)
    } catch (error: any) {
        console.error("Error creating machine:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Machine code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create machine" }, { status: 500 })
    }
}
