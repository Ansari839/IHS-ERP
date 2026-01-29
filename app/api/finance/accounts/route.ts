
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AccountService } from '@/lib/services/account-service';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const segment = searchParams.get('segment');

        const accounts = await prisma.account.findMany({
            where: {
                ...(segment && { segment: segment as any }),
            },
            orderBy: { code: 'asc' },
        });
        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const account = await AccountService.createAccount(data);
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
