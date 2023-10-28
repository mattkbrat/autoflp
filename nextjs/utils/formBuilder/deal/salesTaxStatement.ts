import { generateOutputFilename, getBusinessData, processArray } from '../functions';
import generate from '../generate';
import { DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';
import { Form } from '@/types/forms';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { dealFinance } from '@/utils/finance/dealFinance';

const businessData = getBusinessData();
const formName: Form = 'Sales Tax Statement';

function buyersGuideDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    return [];
  }

  const finance = dealFinance(deal);
  const person = deal.Account.person;
  const fullname = fullNameFromPerson(person);

  const { city, state_province } = person;

  return processArray([
    deal.cash,
    deal.dealTrades.reduce((acc, curr) => acc + Number(curr.value), 0),
    deal.date,
    deal.dealSalesmen
      .map((s) => fullNameFromPerson(s.Salesman.salesmanPerson))
      .join(','),
    deal.inventory.year,
    deal.inventory.make,
    deal.inventory.vin,
    finance.totalTaxDollar,
    city,
    deal.tax_city,
    finance.cityTaxDollar,
    '', // county,
    deal.tax_county,
    finance.countyTaxDollar,
    state_province,
    deal.tax_state,
    finance.stateTaxDollar,
    fullname,
  ]);
}

async function generateBuyersGuide({
  dealId,
  fullDeal,
  output,
}: {
  dealId?: DealWithRelevant['id'];
  fullDeal?: DealWithRelevant;
  output?: string;
}) {
  try {
    if (typeof fullDeal === 'undefined') {
      if (typeof dealId === 'undefined') {
        throw 'Must provide either "dealId" or "fullDeal"';
      }
      fullDeal = await getDealById(dealId);
    }

    const appFormObj = buyersGuideDataCompiler(fullDeal);

    if (!output) {
      const generatedOutput = generateOutputFilename({
        deal: fullDeal,
        form: formName,
        person: fullDeal?.Account?.person,
      });

      if (Array.isArray(generatedOutput)) {
        output = generatedOutput[0];
      } else {
        output = generatedOutput;
      }
    }

    return generate({
      form: formName,
      data: appFormObj,
      output,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default generateBuyersGuide;
export { generateBuyersGuide };
