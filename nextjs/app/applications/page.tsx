import spreadsheet from '@/lib/google/spreadsheet';
import { camelCase } from 'lodash';
import { type CreditApplication } from '@/types/CreditApplication';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import getApplications from '@/app/applications/getApplications';
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

  const applications = await getApplications();

  if (!applications) {
    return <p>Could not load applications, please try again some other time.</p>;
  }

  return <CreditAppPage apps={applications} />;
};

export default ApplicationsPage;
