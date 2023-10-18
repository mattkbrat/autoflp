import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { processArray } from '../functions';
import generateOutputFilename from '../functions/generateOutputFilename';
import generate from '../generate';
import { DealWithRelevant } from '@/types/prisma/deals';
import getDealById from '@/utils/prisma/deal/getDealById';
import { CreditApplication } from '@/types/CreditApplication';
import { Form } from '@/types/forms';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';

const formName: Form = `Application`;

const dealerID = process.env.DEALER_ID;

function creditFormBuilder(app: CreditApplication) {
  if (typeof app === 'undefined') {
    throw 'Must provide a deal';
  }

  const filled: string[] = [
    app.lastName,
    app.firstName,
    app.middleInitial,
    app.street,
    app.phone,
    app.city,
    app.state,
    app.zip,
    app.lengthOfStayAtAddress,
    app.socialSecurity,
    app.license,
    app.licenseExpirationDate,
    app.dateOfBirth,
    app.companyName,
    app.lengthOfEmployment,
    app.companyAddress,
    app.companyPhone,
    app.supervisorName,
    app.deparatment,
    app.jobDescription,
    app.monthlyIncome,
    app.paymentPerMonth,
    app.landlordsName,
    app.phone,
    app.paymentPerMonth1,
    app.mortageCompany,
    app.phone2,
    app.name, // (a.Reference1.Name,
    app.street1,
    app.cityStateZip,
    app.phone3,
    app.phone4,
    app.name1, // a.Reference2.Name,
    app.street2,
    app.cityStateZip1,
    app.phone5,
    app.phone6,
    app.name2, // a.Reference3.Name,
    app.street3,
    app.cityStateZip2,
    app.phone7,
    app.phone8,
    app.name3, // a.Reference4.Name,
    app.street4,
    app.cityStateZip3,
    app.phone9,
    app.phone10,
    app.name4, // a.Reference5.Name,
    app.street5,
    app.cityStateZip4,
    app.phone11,
    app.phone12,
    app.name5, // a.Reference6.Name,
    app.street6,
    app.cityStateZip5,
    app.phone13,
    app.phone14,
    app.fullNameAsOnDriversLicense,
    app.timestamp,
  ];

  // append to beginning of filled array
  return processArray(filled);
}

async function generateCreditApplicationForm({
  app,
  output,
}: {
  app?: CreditApplication;
  output?: string;
}) {
  if (!app) {
    throw new Error('Must provide an application');
  }
  try {
    const appFormObj = creditFormBuilder(app);

    const person = fullNameFromPerson({
      first_name: app.firstName,
      last_name: app.lastName,
    });

    if (!output) {
      const generatedOutput = generateOutputFilename({
        deal: {
          date: app.timestamp,
        },
        form: formName,
        fullName: person,
      });

      if (Array.isArray(generatedOutput)) {
        output = generatedOutput[0];
      } else {
        output = generatedOutput;
      }
    }

    return await generate({
      form: formName,
      data: appFormObj,
      output,
    });
  } catch (error: any) {
    console.error(error);
    return null;
  }
}

export default generateCreditApplicationForm;

export { creditFormBuilder };
