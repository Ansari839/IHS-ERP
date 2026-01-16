import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const location = await prisma.location.findUnique({
            where: { id },
        });

        if (!location) {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }

        return NextResponse.json(location);
    } catch (error) {
        console.error("Error fetching location:", error);
        return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const { name, description, status } = body;

        const location = await prisma.location.update({
            where: { id },
            data: { name, description, status },
        });

        return NextResponse.json(location);
    } catch (error: any) {
        console.error("Error updating location:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Location name already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // In a real scenario, you might want to check for references in other tables
        // (e.g., are there any batches or machines linked to this location?)
        // For now, we'll allow deletion.

        await prisma.location.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Location deleted successfully" });
    } catch (error) {
        console.error("Error deleting location:", error);
        return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
    }
}
