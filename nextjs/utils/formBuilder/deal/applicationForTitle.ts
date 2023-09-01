import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { fullNameFromPerson, processArray } from '../functions';
import generateOutputFilename from '../functions/generateOutputFilename';
import generate from '../generate';
import { DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';

const formName = `Application for Title andor Registration 031522`;

const dealerID = process.env.DEALER_ID;

function appFormBuilder(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    throw 'Must provide a deal';
  }

  if (typeof dealerID === 'undefined') {
    throw 'Must be called as server-side function';
  }

  const personAddress = addressFromPerson({
    person: deal?.Account?.person,
  });

  const personFullName = fullNameFromPerson(deal?.Account?.person);

  const creditorAddress = addressFromPerson({
    person: deal?.creditors?.person,
  });

  const filled = [
    deal?.inventory.fuel,
    deal?.inventory.year,
    deal?.inventory.make,
    deal?.inventory.body,
    deal?.inventory.model,
    deal?.inventory.color,
    deal?.date,
    personFullName,
    deal?.Account.cosigner,
    personAddress.street,
    personAddress.cityStateZip,
    deal?.creditors?.business_name,
    creditorAddress.street,
    creditorAddress.cityStateZip,
    deal?.lien,
    personFullName,
    deal?.Account?.license_number,
    deal?.Account?.license_expiration,
    deal?.Account?.date_of_birth,
    deal?.inventory.cwt,
    dealerID,
  ];

  const vinSplit = deal?.inventory.vin.split('') ?? [''];
  // append to beginning of filled array
  return processArray([...vinSplit, ...filled]);
}

async function generateApplicationForTitleForm({
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
        throw new Error('Must provide either "dealId" or "fullDeal"');
      }
      fullDeal = await getDealById(dealId);
    }

    const appFormObj = appFormBuilder(fullDeal);

    const person = fullDeal?.Account?.person;
    if (!person || typeof fullDeal?.Account?.person === 'undefined') {
      throw new Error('Must have a person associated with the deal');
    }

    if (!output) {
      const generatedOutput = generateOutputFilename({
        deal: fullDeal,
        form: formName,
        person: person,
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
  } catch (error: any) {
    console.error(error);
    return null;
  }
}

export default generateApplicationForTitleForm;

export { appFormBuilder };
