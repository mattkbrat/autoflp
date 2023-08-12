import { generateOutputFilename } from '../functions';
import generateApplicationForTitleForm from './applicationForTitle';
import generateBuyersGuide from './buyersGuide';
import generateBuyersOrder from './buyersOrder';
import generateCover from './cover';
import generateDisclosures from './disclosures';
import generateJointTenancy from './jointTenancy';
import generateOneAndTheSame from './oneAndTheSame';
import generateSalesTaxReceipt from './salesTaxReceiptNew';
import generateSecurity from './security';
import generateStatementOfFact from './statementOfFact';
import { dealById } from 'lib/prisma/deals';
import { forms } from 'types/forms';

import { deal } from '@prisma/client';

async function generateMultipleDealForms({
  forms,
  dealId,
}: {
  forms: forms[];
  dealId: deal['id'];
}) {
  const fullDeal = await dealById(dealId);
  const results: {
    [key: string]: false | string | Blob;
  }[] = [];

  const output = generateOutputFilename({
    deal: fullDeal,
    form: forms,
    person: fullDeal?.Account?.person,
  }) as string[];

  for (const form of forms) {
    const formName = output[forms.indexOf(form)];
    let result: string | null | string[] = null;
    switch (form) {
      case 'Buyers Guide':
        result = await generateBuyersGuide({ fullDeal, output: formName });
        break;
      case 'Application for Title andor Registration 031522':
        result = await generateApplicationForTitleForm({
          fullDeal,
          output: formName,
        });
        break;
      case 'Buyers Order':
        result = await generateBuyersOrder({ fullDeal, output: formName });
        break;
      case 'Cover':
        result = await generateCover({ fullDeal, output: formName });
        break;
      case 'Disclosures':
        result = await generateDisclosures({ fullDeal, output: formName });
        break;
      case 'Down Payment Statement of Fact':
        result = await generateStatementOfFact({ fullDeal, output: formName });
        break;
      case 'Joint Tenancy':
        result = await generateJointTenancy({ fullDeal, output: formName });
        break;
      case 'One And The Same':
        result = await generateOneAndTheSame({ fullDeal, output: formName });
        break;
      case 'Sales Tax Receipt New':
        result = await generateSalesTaxReceipt({ fullDeal, output: formName });
        break;
      case 'Security':
      case 'Security-1':
        result = await generateSecurity({ fullDeal, output: formName });
        break;
      default:
        console.log('Form not found', form);
        break;
    }

    results.push({
      [formName]:
        result === null ? false : Array.isArray(result) ? result[0] : result,
    });
  }

  return results;
}

export default generateMultipleDealForms;
