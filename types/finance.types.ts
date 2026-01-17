
import { Account as PrismaAccount, AccountType, BalanceType, JournalEntry as PrismaJournalEntry, JournalLine as PrismaJournalLine, VoucherType } from "@/app/generated/prisma/client";

export type { AccountType, BalanceType, VoucherType };

export interface Account extends PrismaAccount {
    children?: Account[];
}

export interface JournalLine extends PrismaJournalLine {
    account?: Account;
}

export interface JournalEntry extends PrismaJournalEntry {
    lines: JournalLine[];
}

export interface AccountHierarchyNode extends Account {
    children: AccountHierarchyNode[];
}
