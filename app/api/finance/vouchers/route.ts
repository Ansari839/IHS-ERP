
import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '@/lib/services/journal-service';

export async function GET() {
    try {
        const entries = await JournalService.getEntries();
        return NextResponse.json(entries);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const entry = await JournalService.createEntry(data);
        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
