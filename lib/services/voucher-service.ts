
import prisma from "@/lib/prisma";
import { VoucherType, Prisma } from "@/app/generated/prisma/client";

export class VoucherService {
    /**
     * Generate next voucher number for a given type
     */
    static async generateNumber(type: VoucherType, tx?: Prisma.TransactionClient): Promise<string> {
        const client = tx || prisma;

        const sequence = await client.voucherSequence.upsert({
            where: { type },
            update: { nextValue: { increment: 1 } },
            create: {
                type,
                prefix: this.getDefaultPrefix(type),
                nextValue: 1,
            },
        });

        const paddedNumber = sequence.nextValue.toString().padStart(5, '0');
        return `${sequence.prefix}-${paddedNumber}`;
    }

    /**
     * Get default prefix for voucher types
     */
    private static getDefaultPrefix(type: VoucherType): string {
        const prefixes: Record<VoucherType, string> = {
            JOURNAL: 'JV',
            PAYMENT: 'PV',
            RECEIPT: 'RV',
            PURCHASE: 'PU',
            SALES: 'SA',
            CONTRA: 'CN',
            PURCHASE_RETURN: 'PR',
            SALES_RETURN: 'SR',
            OPENING: 'OP',
            CLOSING: 'CL',
        };
        return prefixes[type] || 'VO';
    }

    /**
     * Validate if a voucher number is already used
     */
    static async validateNumber(number: string, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;
        const existing = await client.journalEntry.findUnique({
            where: { number },
        });
        if (existing) {
            throw new Error(`Voucher number ${number} already exists.`);
        }
    }
}
