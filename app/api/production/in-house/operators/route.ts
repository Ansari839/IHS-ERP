import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const operators = await prisma.operator.findMany({
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(operators)
    } catch (error) {
        console.error("Failed to fetch operators:", error)
        return NextResponse.json({ error: "Failed to fetch operators" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, code, contact, status } = body

        if (!name || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const operator = await prisma.operator.create({
            data: {
                name,
                code,
                contact,
                status: status || "ACTIVE"
            },
        })

        return NextResponse.json(operator)
    } catch (error: any) {
        console.error("Error creating operator:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Operator code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create operator" }, { status: 500 })
    }
}
