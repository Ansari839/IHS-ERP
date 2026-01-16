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

        const operator = await prisma.operator.findUnique({
            where: { id },
        })

        if (!operator) {
            return NextResponse.json({ error: "Operator not found" }, { status: 404 })
        }

        return NextResponse.json(operator)
    } catch (error) {
        console.error("Failed to fetch operator:", error)
        return NextResponse.json({ error: "Failed to fetch operator" }, { status: 500 })
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
        const { name, code, contact, status } = body

        if (!name || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const updatedOperator = await prisma.operator.update({
            where: { id },
            data: { name, code, contact, status },
        })

        return NextResponse.json(updatedOperator)
    } catch (error: any) {
        console.error("Error updating operator:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Operator code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update operator" }, { status: 500 })
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

        await prisma.operator.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Operator deleted successfully" })
    } catch (error) {
        console.error("Error deleting operator:", error)
        return NextResponse.json({ error: "Failed to delete operator" }, { status: 500 })
    }
}
