
import prisma from "@/lib/prisma";
import { Account, AccountType, BalanceType } from "@/app/generated/prisma/client";

export class AccountService {
    /**
     * Generate automatic account code
     */
    static async generateCode(parentId: number | null, type: AccountType): Promise<string> {
        if (!parentId) {
            const prefixMap: Record<AccountType, string> = {
                'ASSET': '1000',
                'LIABILITY': '2000',
                'EQUITY': '3000',
                'INCOME': '4000',
                'EXPENSE': '5000'
            };
            const prefix = prefixMap[type];
            const maxRoot = await prisma.account.findFirst({
                where: { parentId: null, type },
                orderBy: { code: 'desc' },
            });

            if (!maxRoot) return prefix;
            return (parseInt(maxRoot.code) + 1000).toString();
        }

        const parent = await prisma.account.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error('Parent not found');

        const lastChild = await prisma.account.findFirst({
            where: { parentId },
            orderBy: { code: 'desc' },
        });

        const parentCode = parent.code;
        const parentLevel = parent.level;

        if (!lastChild) {
            // First child logic based on depth
            if (parentLevel === 0) return (parseInt(parentCode) + 100).toString();
            if (parentLevel === 1) return (parseInt(parentCode) + 10).toString();
            if (parentLevel === 2) return (parseInt(parentCode) + 1).toString();

            return `${parentCode}01`; // Fallback
        }

        const lastCode = parseInt(lastChild.code);
        if (parentLevel === 0) return (lastCode + 100).toString();
        if (parentLevel === 1) return (lastCode + 10).toString();
        if (parentLevel === 2) return (lastCode + 1).toString();

        return (lastCode + 1).toString();
    }

    /**
     * Setup Default COA Structure
     */
    static async setupDefaultCOA() {
        const count = await prisma.account.count();
        if (count > 0) throw new Error('Chart of Accounts is not empty');

        const structure = [
            {
                name: 'ASSETS', type: AccountType.ASSET, isPosting: false, children: [
                    {
                        name: 'Non-Current Assets', isPosting: false, children: [
                            { name: 'Fixed Assets', isPosting: true },
                            { name: 'Accumulated Depreciation', isPosting: true }
                        ]
                    },
                    {
                        name: 'Current Assets', isPosting: false, children: [
                            {
                                name: 'Cash & Cash Equivalents', isPosting: false, children: [
                                    { name: 'Cash in Hand', isPosting: true },
                                    { name: 'Bank Accounts', isPosting: true }
                                ]
                            },
                            { name: 'Accounts Receivable', isPosting: true },
                            { name: 'Inventory', isPosting: true },
                            { name: 'Advances, Deposits & Prepayments', isPosting: false }
                        ]
                    }
                ]
            },
            {
                name: 'LIABILITIES', type: AccountType.LIABILITY, isPosting: false, children: [
                    { name: 'Equity and Reserves', isPosting: false },
                    { name: 'Non-Current Liabilities', isPosting: false },
                    {
                        name: 'Current Liabilities', isPosting: false, children: [
                            { name: 'Accounts Payable', isPosting: true },
                            { name: 'Accrued Expenses', isPosting: true }
                        ]
                    }
                ]
            },
            {
                name: 'EQUITY', type: AccountType.EQUITY, isPosting: false, children: [
                    { name: 'Share Capital', isPosting: true },
                    { name: 'Retained Earnings', isPosting: true }
                ]
            },
            {
                name: 'INCOME', type: AccountType.INCOME, isPosting: false, children: [
                    { name: 'Sales Revenue', isPosting: true },
                    { name: 'Other Income', isPosting: true }
                ]
            },
            {
                name: 'EXPENSES', type: AccountType.EXPENSE, isPosting: false, children: [
                    { name: 'Cost of Goods Sold', isPosting: true },
                    { name: 'Operating Expenses', isPosting: true },
                    { name: 'Financial Charges', isPosting: true }
                ]
            }
        ];

        const createRecursive = async (items: any[], parentId: number | null = null, type?: AccountType) => {
            for (const item of items) {
                const account = await this.createAccount({
                    name: item.name,
                    type: type || (item.type as AccountType),
                    parentId,
                    isPosting: item.isPosting,
                });
                if (item.children) {
                    await createRecursive(item.children, account.id, type || (item.type as AccountType));
                }
            }
        };

        await createRecursive(structure);
        return { success: true };
    }

    /**
     * Create a new Account
     */
    static async createAccount(data: {
        name: string;
        type: AccountType;
        parentId?: number | null;
        isPosting: boolean;
        openingBalance?: number;
        openingBalanceType?: BalanceType;
        segment?: string;
    }) {
        let level = 0;
        if (data.parentId) {
            const parent = await prisma.account.findUnique({
                where: { id: data.parentId },
            });
            if (!parent) throw new Error('Parent account not found');
            level = parent.level + 1;

            if (parent.isPosting) {
                throw new Error('Parent account cannot be a posting account.');
            }
        }

        const code = await this.generateCode(data.parentId || null, data.type);

        return prisma.account.create({
            data: {
                code,
                name: data.name,
                type: data.type,
                parentId: data.parentId,
                level,
                isPosting: data.isPosting,
                openingBalance: data.openingBalance || 0,
                openingBalanceType: data.openingBalanceType || BalanceType.DR,
                segment: (data.segment as any) || 'GENERAL',
            },
        });
    }

    /**
     * Get Account Hierarchy
     */
    static async getAccountHierarchy(segment?: string) {
        const allAccounts = await prisma.account.findMany({
            where: {
                ...(segment && { segment: segment as any }),
            },
            orderBy: { code: 'asc' },
        });

        const buildTree = (accounts: Account[], parentId: number | null = null): any[] => {
            return accounts
                .filter((acc) => acc.parentId === parentId)
                .map((acc) => ({
                    ...acc,
                    children: buildTree(accounts, acc.id),
                }));
        };

        return buildTree(allAccounts);
    }

    /**
     * Get flattened list of posting accounts
     */
    static async getPostingAccounts(type?: AccountType, segment?: string) {
        return prisma.account.findMany({
            where: {
                isPosting: true,
                ...(type && { type }),
                ...(segment && { segment: segment as any }),
            },
            orderBy: { code: 'asc' },
        });
    }

    /**
     * Get Accounts with calculated Closing Balance
     */
    static async getAccountsWithBalance(type: AccountType, segment?: string) {
        const accounts = await prisma.account.findMany({
            where: {
                type,
                ...(segment && { segment: segment as any }),
                isPosting: true
            },
            include: {
                journalLines: true
            },
            orderBy: { name: 'asc' }
        });

        return accounts.map(acc => {
            const totalDebit = acc.journalLines.reduce((sum, line) => sum + line.debit, 0);
            const totalCredit = acc.journalLines.reduce((sum, line) => sum + line.credit, 0);

            let closingBalance = 0;
            const opening = acc.openingBalance || 0;

            // Logic matches standard accounting equation
            if (type === 'ASSET' || type === 'EXPENSE') {
                // Normal Dr Balance
                // Balance = Opening(Dr) + Debit - Credit
                // If Opening is Cr, treat as negative
                const opDr = acc.openingBalanceType === 'DR' ? opening : -opening;
                closingBalance = opDr + totalDebit - totalCredit;
            } else {
                // Normal Cr Balance (Liability, Equity, Income)
                // Balance = Opening(Cr) + Credit - Debit
                // If Opening is Dr, treat as negative
                const opCr = acc.openingBalanceType === 'CR' ? opening : -opening;
                closingBalance = opCr + totalCredit - totalDebit;
            }

            return {
                ...acc,
                closingBalance,
                // We keep the Prisma generated types clean, but add this calculated field
                journalLines: undefined // Remove heavy lines from list result
            };
        });
    }

    /**
     * Get Account Ledger (Detailed Transactions)
     */
    static async getAccountLedger(accountId: number) {
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) return null;

        const lines = await prisma.journalLine.findMany({
            where: { accountId },
            include: {
                entry: true
            },
            orderBy: {
                entry: {
                    date: 'asc'
                }
            }
        });

        const ledgerItems = lines.map(line => {
            return {
                ...line,
                date: line.entry.date,
                type: line.entry.type,
                number: line.entry.number,
                narration: line.entry.narration
            };
        });

        return {
            account,
            lines: ledgerItems
        };
    }

    /**
     * Delete an Account
     */
    static async deleteAccount(id: number) {
        const childrenCount = await prisma.account.count({
            where: { parentId: id },
        });
        if (childrenCount > 0) throw new Error('Cannot delete account with sub-accounts');

        const transactionsCount = await prisma.journalLine.count({
            where: { accountId: id },
        });
        if (transactionsCount > 0) throw new Error('Cannot delete account with existing transactions');

        return prisma.account.delete({
            where: { id },
        });
    }
}
