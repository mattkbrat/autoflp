import {
  fullNameFromPerson,
  generateOutputFilename,
  processArray,
} from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';

const formName: Form = 'One And The Same';

function oneAndTheSameDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    return [];
  }

  if (deal === null || deal.Account === null) {
    throw `${formName} requires deal`;
  }

  const fullName = fullNameFromPerson(deal.Account.person);

  return processArray([fullName]);
}

async function generateOneAndTheSame({
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
        throw new Error('Must provide either "dealId" or "fullDeal"');
      }
      fullDeal = await getDealById(dealId);
    }

    const appFormObj = oneAndTheSameDataCompiler(fullDeal);

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

export default generateOneAndTheSame;
