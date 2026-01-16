
import prisma from "@/lib/prisma";
import { VoucherType, Prisma } from "@/app/generated/prisma/client";
import { VoucherService } from "./voucher-service";

export interface JournalLineInput {
    accountId: number;
    debit?: number;
    credit?: number;
    narration?: string;
}

export interface JournalEntryInput {
    number?: string;
    date: Date;
    type: VoucherType;
    reference?: string;
    narration?: string;
    lines: JournalLineInput[];
    fiscalYearId?: number;
}

export class JournalService {
    /**
     * Creates a balanced Journal Entry (Voucher)
     */
    static async createEntry(data: JournalEntryInput, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;

        // 1. Validation: Balance Check
        const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal Entry must be balanced. Total Debit (${totalDebit.toFixed(2)}) != Total Credit (${totalCredit.toFixed(2)})`);
        }

        if (data.lines.length < 2) {
            throw new Error("Journal Entry must have at least two lines.");
        }

        // 2. Voucher Number Handling
        let voucherNo = data.number;

        const execute = async (txClient: Prisma.TransactionClient) => {
            if (!voucherNo) {
                voucherNo = await VoucherService.generateNumber(data.type, txClient);
            } else {
                await VoucherService.validateNumber(voucherNo, txClient);
            }

            // Check if Fiscal Year is provided, or try to find active one (simplified for now)
            let fyId = data.fiscalYearId;
            if (!fyId) {
                const activeFY = await txClient.fiscalYear.findFirst({
                    where: { isActive: true }
                });
                fyId = activeFY?.id;
            }

            const entry = await txClient.journalEntry.create({
                data: {
                    number: voucherNo || 'TEMP',
                    date: data.date,
                    type: data.type,
                    reference: data.reference,
                    narration: data.narration,
                    fiscalYearId: fyId,
                    lines: {
                        create: data.lines.map(line => ({
                            accountId: line.accountId,
                            debit: line.debit || 0,
                            credit: line.credit || 0,
                            narration: line.narration
                        }))
                    }
                },
                include: { lines: true }
            });

            return entry;
        };

        if (tx) {
            return await execute(tx);
        } else {
            return await prisma.$transaction(async (t) => await execute(t as any));
        }
    }

    /**
     * Get Entries
     */
    static async getEntries(filters?: { type?: VoucherType }) {
        return prisma.journalEntry.findMany({
            where: { ...filters },
            include: { lines: { include: { account: true } } },
            orderBy: { date: 'desc' }
        });
    }
}
