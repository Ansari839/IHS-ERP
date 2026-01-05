import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const variant = await prisma.variant.findUnique({
            where: { id },
            include: {
                product: true,
            },
        });

        if (!variant) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error fetching variant:", error);
        return NextResponse.json({ error: "Failed to fetch variant" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await req.json();
        const {
            name, sku, price, stock, productId,
            color, count, gsm, width, shade, weave, finish, type
        } = body;

        const variant = await prisma.variant.update({
            where: { id },
            data: {
                name,
                sku,
                price: price !== undefined ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseFloat(stock) : undefined,
                productId: productId ? parseInt(productId) : undefined,
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
        console.error("Error updating variant:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        await prisma.variant.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Variant deleted successfully" });
    } catch (error) {
        console.error("Error deleting variant:", error);
        return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
    }
}
