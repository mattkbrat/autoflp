import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const sheetID = process.env.GOOGLE_SHEET_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (!sheetID) {
  throw new Error('No sheet ID provided');
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

type Range = string[][];

const ApplicationsPage = async () => {
  const key = privateKey;
  const email = clientEmail;

  const serviceAccountAuth = new JWT({
    email,
    key: key,
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(sheetID, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);

  // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  const sheet = doc.sheetsByIndex[0];

  // My document contains duplicate headers, so I'm going to use the raw data
  // Updating the cells would interrupt the form submissions and create new columns,
  // which would interfere with other tools I've built already from the data.
  const range: Range = await sheet.getCellsInRange('A1:Z1000');

  const [headers, ...rows] = range;

  return (
    <div>
      <h1>{sheet.title}</h1>
      <pre>{sheet.sheetId}</pre>

      <table>
        <thead>
          <tr>
            {headers.map((header, n) => (
              <th key={'header-' + n}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, n) => (
            <tr key={`row-${n}`}>
              {row.map((cell, n) => (
                <td key={`td-${n}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsPage;
