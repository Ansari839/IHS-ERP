import { AccountService } from "@/lib/services/account-service";
import { PartyListClient } from "@/components/fabtex/parties/party-list-client";
import { AccountType } from "@/app/generated/prisma/client";

export const dynamic = 'force-dynamic'

export default async function FabTexVendorsPage() {
    // Fetch only YARN vendors (Liability type + YARN segment)
    const vendors = await AccountService.getAccountsWithBalance(AccountType.LIABILITY, 'YARN');

    return (
        <div className="p-8">
            <PartyListClient
                initialData={vendors}
                type="Vendor"
                segment="YARN"
                accountType={AccountType.LIABILITY}
            />
        </div>
    )
}
