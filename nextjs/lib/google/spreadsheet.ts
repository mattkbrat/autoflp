import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const sheetID = process.env.GOOGLE_SHEET_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (!sheetID) {
  throw new Error('No sheet ID provided');
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const spreadsheet = async (sheetIndex = 0) => {
  const key = privateKey;
  const email = clientEmail;

  const serviceAccountAuth = new JWT({
    email,
    key: key,
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(sheetID, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets

  return doc.sheetsByIndex[sheetIndex];
};

export default spreadsheet;
