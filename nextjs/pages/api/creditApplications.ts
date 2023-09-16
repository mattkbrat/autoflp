import { generateMultipleDealForms } from '@/utils/formBuilder/deal';
import generateCreditApplicationForm from '@/utils/formBuilder/creditApplications/application';
import { NextApiRequest, NextApiResponse } from 'next';
import { Override } from '@/types/Oerride';
import { CreditApplication } from '@/types/CreditApplication';
import { withSessionRoute } from '@/utils/auth/withSession';

type CreditApplicationRequest = Override<
  NextApiRequest,
  {
    body: CreditApplication;
  }
>;

export const creditApplicationHandler = async (
  req: CreditApplicationRequest,
  res: NextApiResponse,
) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const appData = req.body;

  if (!appData || !appData.timestamp) {
    return res.status(400).json({
      error: 'No application data provided',
    });
  }

  const presignedUrl = await generateCreditApplicationForm({
    app: appData,
    output: `credit-application-${appData.fullNameAsOnDriversLicense}-${appData.timestamp}.pdf`,
  });

  if (!presignedUrl) {
    return res.status(500).json({
      error: 'Error generating credit application',
    });
  }

  res.send({ url: presignedUrl });
};

export default withSessionRoute(creditApplicationHandler);
