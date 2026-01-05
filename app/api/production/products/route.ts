import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        const where: any = {};
        if (type) {
            where.type = type;
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                unit: true,
                variants: true,
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, code, description, type, categoryId, unitId } = body;

        if (!name || !code || !type || !categoryId || !unitId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                code,
                description,
                type,
                categoryId: parseInt(categoryId),
                unitId: parseInt(unitId),
            },
            include: {
                category: true,
                unit: true,
            }
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error creating product:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Product code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
