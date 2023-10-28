const path = require('path');
const appDirectory = process.env.APPDATA;

const envFormsDirectory = process.env.FORMS_DIRECTORY;

console.log('appDirectory', appDirectory);

export const rootPath = process.cwd();

console.log('rootPath', rootPath);

if (!envFormsDirectory && !appDirectory) throw new Error('No forms directory found');

// /lib/forms
const inputPath = appDirectory
  ? `${path.join(appDirectory, 'autoflp', 'forms')}`
  : envFormsDirectory;

if (!inputPath) throw new Error('No forms directory found');

console.log('inputPath', inputPath);

// /public/forms/filled
// export const formsPath = `${rootPath}/public/forms/filled/`;
export const formsPath = `${inputPath}/autoflp/filled/`;

export const outputFullPath = (output: string) =>
  `${formsPath}${output.includes('.pdf') ? output : output + '.pdf'}`;

export const inputFullPath = (form: string) => `${inputPath}/${form}.pdf`;
