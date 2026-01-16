
import { NextResponse } from 'next/server';
import { AccountService } from '@/lib/services/account-service';

export async function POST() {
    try {
        const result = await AccountService.setupDefaultCOA();
        return NextResponse.json(result);
    } catch (error) {
        console.error("COA Setup Error:", error);
        return NextResponse.json({ message: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
