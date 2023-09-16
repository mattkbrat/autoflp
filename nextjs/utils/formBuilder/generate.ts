import fs from 'fs';

import pdftk from 'node-pdftk';
import { Form } from '@/types/forms';
import { formsPath, inputFullPath, outputFullPath } from '@/lib/paths';
import { upload } from '@/utils/minio/upload';

async function generate({
  form,
  output,
  data,
  concat,
  bucket = 'filled',
}: {
  form: Form;
  output: string;
  data: string[] | string[][];
  bucket?: string;
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

      return generate({
        form,
        output: `${index}_${output}`,
        data: item,
        concat,
      });
    });
  }

  const inputPath = inputFullPath(form);
  // const outputPath = outputFullPath(output);

  try {
    // throw if form does not exist
    if (fs.readFileSync(inputPath).length === 0) {
      throw new Error(`Form ${form} does not exist`);
    }

    // console.log({ data, dataObj });

    // Wrap the pdftk call in a promise so we can await it
    // const presigned = (await new Promise((resolve) => {
    //   pdftk
    //     .input(inputPath)
    //     .fillForm(dataObj)
    //     .flatten()
    //     .output()
    //     .then((buffer: any) => {
    //       // write to file
    //       // fs.writeFileSync(outputPath, buffer);

    //       // upload to s3
    //       return upload({
    //         bucket,
    //         filename: output,
    //         file: buffer,
    //       });
    //     })
    //     .then((url) => {
    //       resolve(url);
    //     })
    //     .catch((error: any) => {
    //       throw error;
    //     });
    // })) as string;

    // if (!isDev) {
    //   pdftk.configure({
    //     bin: '/usr/local/bin/pdftk',
    //     tempDir: '/app/data/tmp',
    //   });
    // }

    try {
      const buffer = await pdftk.input(inputPath).fillForm(dataObj).flatten();

      return await upload({
        bucket,
        filename: output,
        file: await buffer.output(),
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default generate;
