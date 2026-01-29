import { AccountService } from "@/lib/services/account-service";
import { PartyListClient } from "@/components/fabtex/parties/party-list-client";
import { AccountType } from "@/app/generated/prisma/client";

export const dynamic = 'force-dynamic'

export default async function FabTexCustomersPage() {
    // Fetch only YARN customers (Asset type + YARN segment)
    const customers = await AccountService.getPostingAccounts(AccountType.ASSET, 'YARN');

    return (
        <div className="p-8">
            <PartyListClient
                initialData={customers}
                type="Customer"
                segment="YARN"
                accountType={AccountType.ASSET}
            />
        </div>
    )
}
