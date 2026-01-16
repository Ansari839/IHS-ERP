import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const shifts = await prisma.shift.findMany({
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(shifts)
    } catch (error) {
        console.error("Failed to fetch shifts:", error)
        return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, startTime, endTime } = body

        if (!name || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const shift = await prisma.shift.create({
            data: { name, startTime, endTime },
        })

        return NextResponse.json(shift)
    } catch (error: any) {
        console.error("Error creating shift:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Shift name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create shift" }, { status: 500 })
    }
}
