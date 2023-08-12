import {
  fullNameFromPerson,
  generateOutputFilename,
  getBusinessData,
  processArray,
} from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import formatDate from '@/utils/date/format';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';

const businessData = getBusinessData();
const formName: Form = 'Disclosures';

function disclosuresDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    throw 'Must provide either "dealId" or "fullDeal"';
  }

  if (deal === null || deal.Account === null) {
    throw 'Cover requires deal.';
  }

  return processArray([
    deal.inventory.vin,
    businessData.businessName,
    fullNameFromPerson(deal?.Account?.person),
    formatDate(deal.date, 'MM/dd/yyyy'),
  ]);
}

async function generateDisclosures({
  dealId,
  fullDeal,
  output,
}: {
  dealId?: Deal['id'];
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

    const appFormObj = disclosuresDataCompiler(fullDeal);

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

export default generateDisclosures;
