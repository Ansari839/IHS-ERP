
import { NextResponse } from 'next/server';
import { AccountService } from '@/lib/services/account-service';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const segment = searchParams.get('segment');
        const hierarchy = await AccountService.getAccountHierarchy(segment || undefined);
        return NextResponse.json(hierarchy);
    } catch (error) {
        console.error("Error fetching account hierarchy:", error);
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
