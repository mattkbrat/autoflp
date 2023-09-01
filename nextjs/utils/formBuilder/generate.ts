import fs from 'fs';

import pdftk from 'node-pdftk';
import { Form } from '@/types/forms';

async function generate({
  form,
  output,
  data,
  concat,
}: {
  form: Form;
  output: string;
  data: string[] | string[][];
  concat?: {
    concat: true;
    lookup: string;
    final: boolean;
  };
}) {
  const dataObj: {
    [key: string]: string;
  } = {};

  data.map((item, index) => {
    dataObj[`${index}`] = `${item}`;
  });

  // make the output file url safe
  if (output.includes('.pdf')) {
    output = output.replace('.pdf', '');
  }
  output = output.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';

  const isArrayOfArrays = (data: any) => {
    return Array.isArray(data) && data.every(Array.isArray);
  };

  if (isArrayOfArrays(data)) {
    // this is a hack to get around the type system TODO: fix this
    // Call the function again with every array
    const thisData = data as unknown as string[][];
    thisData.map((item, index) => {
      concat = {
        concat: true,
        lookup: output,
        final: index === thisData.length - 1,
      };

      const data = generate({
        form,
        output: `${index}_${output}`,
        data: item,
        concat,
      });
      return data;
    });
  }

  const rootPath = process.cwd();
  const formsPath = `${rootPath}/public/forms/filled`;
  const inputPath = `${rootPath}/lib/forms`;
  const outputFullPath = `${formsPath}/${
    output.includes('.pdf') ? output : output + '.pdf'
  }`;
  const inputFullPath = `${inputPath}/${form}.pdf`;

  try {
    // throw if form does not exist
    if (fs.readFileSync(inputFullPath).length === 0) {
      throw new Error(`Form ${form} does not exist`);
    }

    // Wrap the pdftk call in a promise so we can await it
    await new Promise((resolve) => {
      pdftk
        .input(inputFullPath)
        .fillForm(dataObj)
        .flatten()
        .output()
        .then((buffer: any) => {
          // write to file
          fs.writeFileSync(outputFullPath, buffer);
        })
        .then(() => {
          resolve(null);
        })
        .catch((error: any) => {
          throw error;
        });
    });

    // The below is not working, so we're using the above for now

    return fs.readdirSync('./public/forms/filled').filter((file) => {
      return file.includes(output);
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default generate;
