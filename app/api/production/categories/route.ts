import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, code, description } = body;

        if (!name || !code) {
            return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, code, description },
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
