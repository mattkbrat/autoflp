import {
  addressFromPerson,
  fullNameFromPerson,
  generateOutputFilename,
  processArray,
} from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import formatDate from '@/utils/date/format';
import getDealById from '@/utils/prisma/deal/getDealById';

const formName: Form = 'Cover';

function coverDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    return [];
  }

  if (deal === null || deal.Account === null) {
    throw 'Cover requires deal.';
  }

  const address = addressFromPerson({
    person: deal.Account?.person,
  });

  const salesmen = deal.dealSalesmen
    ?.map((s) => {
      const person = s.Salesman.salesmanPerson;

      return fullNameFromPerson(person);
    })
    .join(',');
  const vinSubstr = deal.inventory?.vin?.slice(-6);

  return processArray([
    [fullNameFromPerson(deal?.Account?.person), deal.Account.cosigner ?? null].join(
      ',',
    ),
    address.street,
    address.cityStateZip,
    deal.Account?.person?.phone_primary,
    deal.Account?.person?.email_primary,
    `${(deal.inventory?.year ?? '0').slice(-2)} ${deal.inventory?.make} ${
      deal.inventory?.model
    }`,
    `${deal.term}; ${deal.pmt}`,
    formatDate(deal.date, 'MMMM d, yyyy'),
    vinSubstr,
    salesmen,
    deal.lien,
    deal.down,
    '', // TODO - down owed
  ]);
}

async function generateCover({
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

    const appFormObj = coverDataCompiler(fullDeal);

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

export default generateCover;
