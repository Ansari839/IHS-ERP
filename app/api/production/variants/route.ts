import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        const where: any = {};
        if (productId) {
            where.productId = parseInt(productId);
        }

        const variants = await prisma.variant.findMany({
            where,
            include: {
                product: true,
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(variants);
    } catch (error) {
        console.error("Error fetching variants:", error);
        return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name, sku, price, stock, productId,
            color, count, gsm, width, shade, weave, finish, type
        } = body;

        if (!name || !sku || !productId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const variant = await prisma.variant.create({
            data: {
                name,
                sku,
                price: price ? parseFloat(price) : 0,
                stock: stock ? parseFloat(stock) : 0,
                productId: parseInt(productId),
                color,
                count,
                gsm,
                width,
                shade,
                weave,
                finish,
                type
            },
            include: {
                product: true,
            }
        });

        return NextResponse.json(variant);
    } catch (error: any) {
        console.error("Error creating variant:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }
}
