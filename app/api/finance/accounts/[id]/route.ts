
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const account = await prisma.account.findUnique({
            where: { id: parseInt(id) },
            include: { children: true, parent: true }
        });
        if (!account) return NextResponse.json({ message: "Account not found" }, { status: 404 });
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const account = await prisma.account.update({
            where: { id: parseInt(id) },
            data
        });
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.account.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ message: "Account deleted" });
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
