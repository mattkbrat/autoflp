import { generateOutputFilename, getBusinessData, processArray } from '../functions';
import generate from '../generate';
import { dealById, dealByIdType } from 'lib/prisma/deals';

import { deal } from '@prisma/client';

const businessData = getBusinessData();
const formName = 'Buyers Guide';

function buyersGuideDataCompiler(deal: dealByIdType) {
  if (typeof deal === 'undefined') {
    return [];
  }

  return processArray([
    deal?.inventory.make,
    deal?.inventory.model,
    deal?.inventory.year,
    deal?.inventory.vin,
    businessData.businessName,
    businessData.address,
    businessData.phoneNumber,
    businessData.email,
  ]);
}

async function generateBuyersGuide({
  dealId,
  fullDeal,
  output,
}: {
  dealId?: deal['id'];
  fullDeal?: dealByIdType;
  output?: string;
}) {
  try {
    if (typeof fullDeal === 'undefined') {
      if (typeof dealId === 'undefined') {
        throw 'Must provide either "dealId" or "fullDeal"';
      }
      fullDeal = await dealById(dealId);
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
