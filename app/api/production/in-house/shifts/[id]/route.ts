import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const shift = await prisma.shift.findUnique({
            where: { id },
        })

        if (!shift) {
            return NextResponse.json({ error: "Shift not found" }, { status: 404 })
        }

        return NextResponse.json(shift)
    } catch (error) {
        console.error("Failed to fetch shift:", error)
        return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await request.json()
        const { name, startTime, endTime } = body

        if (!name || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const updatedShift = await prisma.shift.update({
            where: { id },
            data: { name, startTime, endTime },
        })

        return NextResponse.json(updatedShift)
    } catch (error: any) {
        console.error("Error updating shift:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Shift name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update shift" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.shift.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Shift deleted successfully" })
    } catch (error) {
        console.error("Error deleting shift:", error)
        return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 })
    }
}
