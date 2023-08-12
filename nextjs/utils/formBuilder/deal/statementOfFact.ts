import { generateOutputFilename, processArray } from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import formatDate from '@/utils/date/format';
import { datePlusMonths } from '@/utils/date';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';

const formName: Form = 'Down Payment Statement of Fact';

function statementOfFactCompiler(deal: dealByIdType) {
  if (typeof deal === 'undefined') {
    throw 'Must provide either "dealId" or "fullDeal"';
  }

  if (deal === null || deal.Account === null) {
    throw 'Cover requires deal.';
  }

  return processArray([
    '', // TODO Down owed
    formatDate(datePlusMonths(deal.date, 1), 'MM/dd/yyyy'),
    deal.inventory.mileage === 'EXEMPT' ? '' : deal.inventory.mileage,
  ]);
}

async function generateStatementOfFact({
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

    const appFormObj = statementOfFactCompiler(fullDeal);

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

export default generateStatementOfFact;
