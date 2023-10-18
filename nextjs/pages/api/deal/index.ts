import { NextApiRequest, NextApiResponse } from 'next';
import { DealsWithRelevant } from '@/types/prisma/deals';
import {
  closeDeals,
  createDeal,
  createDealSalesman,
  getDealsWithRelevant,
} from '@/utils/prisma/deal';
import notifyDeal from '@/utils/pushover/deal';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import updateDeal from '@/utils/prisma/deal/updateDeal';
import { generateMultipleDealForms } from '@/utils/formBuilder/deal';

async function dealFetcher(req: NextApiRequest, res: NextApiResponse) {
  const transactionType = req.query.transactionType;
  const lookupType =
    transactionType === 'active'
      ? 1
      : transactionType === 'inactive'
      ? 0
      : undefined;

  switch (req.method) {
    case 'GET':
      if (lookupType !== 1 && lookupType !== 0 && lookupType !== undefined) {
        res.status(400).json({
          error: 'Invalid transaction type',
        });
      } else {
        const fetchedDeals: DealsWithRelevant = await getDealsWithRelevant({
          state: lookupType,
        });
        fetchedDeals.forEach((deal) => {
          deal.date = new Date(deal.date).toLocaleDateString();
        });
        res.status(200).json({ deals: fetchedDeals });
      }
      break;
    case 'PUT':
      try {
        const { id, ...body } = JSON.parse(req.body);

        const updated = await updateDeal({
          id,
          data: body,
        });

        await notifyDeal({
          fullName: fullNameFromPerson(updated.Account.person),
          invString: formatInventory(updated.inventory),
          dealId: updated.id,
          type: 'UPDATE',
        });

        return res.send(updated);
      } catch (error: any) {
        console.error(error);
        return res
          .status(500)
          .json({ error: error?.message ?? 'Internal server error' });
      }
    case 'POST':
      const { body: reqBody, salesman, tradeVehicles: trades } = req.body;

      const { cosigner, ...deal } = reqBody;

      try {
        if (typeof deal.id === 'undefined') {
          throw new Error('No deal id provided');
        }

        // Try to find existing deal id using inventory, date, and account

        const createdDeal = await createDeal({
          deal,
          cosigner: cosigner,
          trades: typeof trades === 'string' ? [trades] : trades,
          salesmen: typeof salesman === 'string' ? [salesman] : salesman,
        });

        const forms = await generateMultipleDealForms({
          forms: [
            'DR2395_2022',
            'Buyers Guide',
            'Buyers Order',
            'Cover',
            'Disclosures',
            'Down Payment Statement of Fact',
            'Joint Tenancy',
            'One And The Same',
            'Sales Tax Receipt New',
            'Security',
          ],
          dealId: createdDeal.id,
        });

        res.status(200).json({ deal: createdDeal, forms });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message ?? 'Internal server error' });
      }

      break;

    case 'DELETE':
      let ids = req.query.close;

      if (typeof ids === 'string' && ids.includes(',')) {
        ids = ids.split(',');
      }

      if (!Array.isArray(ids)) {
        if (typeof ids === 'string') {
          ids = [ids];
        } else {
          res.status(400).json({
            error: 'Invalid request body',
          });
          return;
        }
      }

      try {
        const closedDeals = await closeDeals({ deals: ids });
        // We are notifying the deal closure in the closeDeals function.

        return res.status(200).json({ closedDeals });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message ?? 'Internal server error' });
      }

      break;

    default:
      res.status(405).json({
        error: 'Method not allowed',
      });
      break;
  }

  // Simplify above

  return;
}

export default dealFetcher;
