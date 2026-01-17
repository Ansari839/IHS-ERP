
import { NextResponse } from 'next/server';
import { AccountService } from '@/lib/services/account-service';

export async function GET() {
    try {
        const hierarchy = await AccountService.getAccountHierarchy();
        return NextResponse.json(hierarchy);
    } catch (error) {
        console.error("Error fetching account hierarchy:", error);
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
