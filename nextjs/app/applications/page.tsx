import spreadsheet from '@/lib/google/spreadsheet';

type Range = string[][];

const ApplicationsPage = async () => {
  // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`

  const sheet = await spreadsheet();

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
