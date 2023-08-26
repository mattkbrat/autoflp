import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import { AnyObject } from 'chart.js/dist/types/basic';
import flattenObject from '@/utils/flattenObject';

const desiredFields = [
    'Fuel Type - Primary',
    'Make',
    'Model',
    'Model Year',
    'Plant Country',
    'Plant State',
    'Vehicle Type',
    'Vehicle Type - Simple',
    'Gross Vehicle Weight Rating From',
  ];

async function fetchNHTSA(vin_number: string) {
    if (!vin_number) {
      return {
        error: 'Invalid VIN number',
      };
    } else {
      let vinSearch = vin_number;
      if (vinSearch.length < 17) {
        vinSearch += '*';
      }
      const fetchedVin = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinSearch}?format=json`,
      );

      if (fetchedVin.status !== 200) {
        return {
          error: 'Invalid VIN number',
        };
      }

      const fetchedVinJson = await fetchedVin.json();

      const vinData: AnyObject = {};

      const message: string = fetchedVinJson.Message;
      if (!message.includes('Results returned successfully')) {
        return {
          error: 'Invalid VIN number',
        };
      }

      const results: Array<AnyObject> = fetchedVinJson.Results;

      results.forEach((result) => {
        if (desiredFields.includes(result.Variable)) {
          vinData[result.Variable] = result.Value;
        }
      });

      if (vinData['Gross Vehicle Weight Rating From']) {
        // Class xxx: ...
        const value = vinData['Gross Vehicle Weight Rating From'].replace(
          'Class ',
          '',
        );
        const positionOfColon = value.indexOf(':');
        vinData['Class'] = value.replace('Class ', '').slice(0, positionOfColon);
      }

      if (vinData['Model Year']) {
        vinData['Model Year'] = parseInt(vinData['Model Year']);
      }

      // Uppercase selected fields
      const fieldsToUppercase = [
        'Make',
        'Model',
        'Vehicle Type',
        'Vehicle Type - Simple',
        'Fuel Type - Primary',
      ];
      fieldsToUppercase.forEach((field) => {
        if (vinData[field]) {
          vinData[field] = vinData[field].toUpperCase();
        }
      });

      return {
        selected: vinData,
        // Collapse to a single object
        all: flattenObject(
          results
            .filter((result) => result.Value !== 'Not Applicable')
            .map((result) => {
              return {
                [result.Variable]: result.Value,
              };
            }),
        ),
      };
    }
  }


const InventoryByVinHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { id: vin } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof vin !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const no = req.query.vin;
  if (typeof no !== 'string') {
    res.status(400).json({
      error: 'Invalid VIN number',
    });
  } else {
    const fetchedVin = await fetchNHTSA(no);
    if (fetchedVin.selected === undefined) {
      res.status(400).json({
        error: 'Invalid VIN number',
      });
      return;
    }
    res.status(200).json({
      vin: {
        make: fetchedVin.selected['Make'],
        model: fetchedVin.selected['Model'],
        year: fetchedVin.selected['Model Year']
          ? fetchedVin.selected['Model Year'].toString()
          : null,
        // type: fetchedVin.selected['Vehicle Type'],
        typeSimple: fetchedVin.selected['Vehicle Type - Simple'],
        fuel: fetchedVin.selected['Fuel Type - Primary'],
        cwt: fetchedVin.selected['Class'],
      },
      all: fetchedVin.all,
    });
  }
  return;

};

export default withSessionRoute(InventoryByVinHandler);
