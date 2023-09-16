const path = require('path');

import isDev from '@/lib/isDev';

export const rootPath = process.cwd();

console.log('rootPath', rootPath);

// /lib/forms
export const inputPath = isDev ? `${path.join(rootPath, 'lib', 'forms')}` : `/forms`;

// /public/forms/filled
// export const formsPath = `${rootPath}/public/forms/filled/`;
export const formsPath = `${inputPath}/filled/`;

export const outputFullPath = (output: string) =>
  `${formsPath}${output.includes('.pdf') ? output : output + '.pdf'}`;

export const inputFullPath = (form: string) => `${inputPath}/${form}.pdf`;
