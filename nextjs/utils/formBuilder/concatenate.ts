import fs from 'fs';

import { AnyObject } from 'chart.js/dist/types/basic';
import pdftk from 'node-pdftk';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

function concatenatePdf(filenames: string[], output: string) {
  if (output.includes('.pdf')) {
    output = output.replace('.pdf', '');
  }
  // output = output.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';

  const input: AnyObject = {};

  for (const file of filenames) {
    const index = filenames.indexOf(file);
    input[alphabet[index]] = `./public/forms/filled/${file}`;
  }

  // const input = filenames.map((filename: string, n: number) => {
  //     return {[alphabet[n]]: fs.readFileSync(`./public/forms/filled/${filename}`)}
  // });

  const cat = alphabet.slice(0, filenames.length).join(' ');

  // output = `./public/forms/filled/${output}`;

  pdftk
    .input(input)
    .cat(cat)
    .output('./temp.pdf')
    .then((buffer: any) => {
      // write to file
      fs.writeFileSync(`./public/forms/filled/test.pdf`, buffer);
    })
    .catch((error: any) => {
      console.error(error);
    });
}

export default concatenatePdf;
