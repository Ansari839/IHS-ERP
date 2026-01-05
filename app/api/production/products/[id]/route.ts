import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                unit: true,
                variants: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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
        const { name, code, description, type, categoryId, unitId } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                code,
                description,
                type,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                unitId: unitId ? parseInt(unitId) : undefined,
            },
            include: {
                category: true,
                unit: true,
            }
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Product code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Check if product has variants or other relations
        const variantsCount = await prisma.variant.count({
            where: { productId: id }
        });

        if (variantsCount > 0) {
            return NextResponse.json({ error: "Cannot delete product with associated variants" }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
