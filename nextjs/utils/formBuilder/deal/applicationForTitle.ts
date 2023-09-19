import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { fullNameFromPerson, processArray } from '../functions';
import generateOutputFilename from '../functions/generateOutputFilename';
import generate from '../generate';
import { DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';
import { type Form } from '@/types/forms';
import { getBusinessData } from '@/utils/formBuilder/functions';

const formName: Form = `DR2395_2022`;

const dealerID = process.env.DEALER_ID;

const businessInfo = getBusinessData();

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
    '', // Flex fuel -yes
    '', // Flex fuel -no
    '', // plug-in electric -yes
    '', // plug-in electric -no
    deal?.inventory.year,
    deal?.inventory.make,
    deal?.inventory.body,
    deal?.inventory.model,
    deal?.inventory.color,
    deal?.inventory.cwt,
    '', // off-highway vehicle -yes
    '', // off-highway vehicle -no
    '', // snowmobile -yes
    '', // snowmobile -no
    dealerID,
    deal?.date,
    '', // commercial use -yes
    '', // commercial use -no
    '', // msrp
    '', // size (w x l)
    '', // bus cap. -- adult
    '', // bus cap. -- juvenile
    `${[
      personFullName,
      deal?.Account.cosigner,
      personAddress.street,
      personAddress.cityStateZip,
    ].join('\n')}`,
    '', // lease buyout -yes
    '', // lease buyout -no
    '', // legal-names
    '', // alternate address
    '', // dr 2421 attached (checkbox)
    `${[
      deal?.creditors?.business_name,
      creditorAddress.street,
      creditorAddress.cityStateZip,
    ].join('\n')}`,
    '', // second lienholder, if any
    deal?.lien,
    '', // second lien amount
    '', // alternate address (lienholder)
    '', // alternate address (second lienholder)
    '', // signature
    deal.date,
    personFullName,
    'x', // colorado drivers license
    '', // colorado id,
    '', // other form of id
    '', // other form of id (write-in)
    deal.Account.license_number,
    deal?.Account?.license_expiration,
    deal?.Account?.date_of_birth,
    businessInfo.primaryDealerName,
    '', // dealer signature
    deal.date,

    // join tenancy with rights of survivorship
    personFullName,
    deal.date,
    deal.Account.cosigner,
    deal.date,
    '', // second cosigner
    '', // date
    deal.inventory.vin,
    deal.inventory.year,
    deal.inventory.make,
    deal.inventory.model,
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
