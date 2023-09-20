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

  const tryConnection = async (_attempt = 0) => {
    try {
      const doc = new GoogleSpreadsheet(sheetID, serviceAccountAuth);

      await doc.loadInfo(); // loads document properties and worksheets

      console.info('New Google Sheets connection');

      const sheet = doc.sheetsByIndex[sheetIndex];

      console.log('Loaded doc: ' + doc.title, {
        sheet: sheet.title,
        id: sheet.sheetId,
        rows: doc.sheetsByIndex[sheetIndex].rowCount,
      });

      return sheet;
    } catch (error) {
      console.error(error);
      if (_attempt < 3) {
        setTimeout(() => {
          console.log('Trying again...');
          return tryConnection(_attempt + 1);
        }, 1000);
      } else {
        throw new Error('Could not connect to Google Sheets');
      }
    }
  };

  return tryConnection();
};

export default spreadsheet;
