import { InventoryWithDeals } from '@/types/prisma/inventory';
import { BusinessData } from '@/types/BusinessData';
import { AccountsWithRelevant } from '@/types/prisma/accounts';
import { CreditApplication } from '@/types/CreditApplication';

type HomeV2Props = {
  selectedInventory?: InventoryWithDeals | null;
  businessData: BusinessData;
  accounts: AccountsWithRelevant;
  applications: CreditApplication[] | null;
};

export default HomeV2Props;
