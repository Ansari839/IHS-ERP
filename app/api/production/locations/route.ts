import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, status } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const location = await prisma.location.create({
            data: { name, description, status: status || "ACTIVE" },
        });

        return NextResponse.json(location);
    } catch (error: any) {
        console.error("Error creating location:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Location already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
    }
}
