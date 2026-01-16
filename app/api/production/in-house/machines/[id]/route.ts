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

        const machine = await prisma.machine.findUnique({
            where: { id },
            include: {
                location: true
            }
        })

        if (!machine) {
            return NextResponse.json({ error: "Machine not found" }, { status: 404 })
        }

        return NextResponse.json(machine)
    } catch (error) {
        console.error("Failed to fetch machine:", error)
        return NextResponse.json({ error: "Failed to fetch machine" }, { status: 500 })
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
        const { name, code, type, status, locationId } = body

        if (!name || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const updatedMachine = await prisma.machine.update({
            where: { id },
            data: {
                name,
                code,
                type,
                status,
                locationId: locationId ? parseInt(locationId) : null
            },
            include: {
                location: true
            }
        })

        return NextResponse.json(updatedMachine)
    } catch (error: any) {
        console.error("Error updating machine:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Machine code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update machine" }, { status: 500 })
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

        await prisma.machine.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Machine deleted successfully" })
    } catch (error) {
        console.error("Error deleting machine:", error)
        return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 })
    }
}
