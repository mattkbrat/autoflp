import { generateOutputFilename, getBusinessData, processArray } from '../functions';
import generate from '../generate';
import { DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';

const businessData = getBusinessData();
const formName = 'Buyers Guide';

function buyersGuideDataCompiler(deal: DealWithRelevant) {
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
