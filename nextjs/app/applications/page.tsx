import spreadsheet from '@/lib/google/spreadsheet';
import { camelCase } from 'lodash';
import { type CreditApplication } from '@/types/CreditApplication';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import CreditAppsPage from '@/app/applications/ApplicationPage';
type Range = string[][];

const CreditAppPage = dynamic(() => import('@/app/applications/ApplicationPage'), {
  ssr: false,
});

const ApplicationsPage = async () => {
  // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`

  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  const sheet = await spreadsheet(2);

  if (!sheet) {
    return (
      <>
        <p>This service is currently unavailable. Please try again later.</p>
        <Link href={'/'}>Return to home</Link>
      </>
    );
  }

  const applications: CreditApplication[] = [];

  const replaceGoogleDriveUrlWithImageLink = (url: string) => {
    // https://drive.google.com/open?id=1ttTdvjZAnFMfPJzDvfEFoLNbLGyHebCX -->
    //   https://drive.google.com/uc?export=view&id=XXX

    if (!url) {
      return '';
    }

    const id = url.split('id=')[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  };

  // My document contains duplicate headers, so I'm going to use the raw data
  // Updating the cells would interrupt the form submissions and create new columns,
  // which would interfere with other tools I've built already from the data.
  const range: Range = await sheet.getCellsInRange('A:BQ');

  const [headers, ...rows] = range;

  let newApplication = {} as CreditApplication;

  rows.forEach((row) => {
    newApplication = {} as CreditApplication;
    row.forEach((cell, n) => {
      // The key is the header, but camelCased
      let key = camelCase(headers[n]) as keyof CreditApplication;

      if (newApplication[key]) {
        const keyCount = Object.keys(newApplication).filter((k) =>
          k.includes(key),
        ).length;
        key = `${key}${keyCount}`;
      }

      newApplication[key] = cell;
    });

    // newApplication.paystub = replaceGoogleDriveUrlWithImageLink(
    //   newApplication.paystub,
    // );
    // newApplication.license2 = replaceGoogleDriveUrlWithImageLink(
    //   newApplication.license2,
    // );
    // newApplication.proofOfResidency = replaceGoogleDriveUrlWithImageLink(
    //   newApplication.proofOfResidency,
    // );

    const { firstName, lastName, timestamp } = newApplication;

    if (!firstName || !lastName || !timestamp) {
      return;
    }

    const fullName = fullNameFromPerson({
      first_name: firstName,
      last_name: lastName,
    });

    newApplication.key = `${fullName} ${timestamp}`;
    applications.push(newApplication);
  });

  return <CreditAppPage apps={applications} />;
};

export default ApplicationsPage;
