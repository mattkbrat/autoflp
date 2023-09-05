export const rootPath = process.cwd();

// /lib/forms
export const inputPath = `${rootPath}/lib/forms/`;

// /public/forms/filled
export const formsPath = `${rootPath}/public/forms/filled/`;

export const outputFullPath = (output: string) =>
  `${formsPath}${output.includes('.pdf') ? output : output + '.pdf'}`;

export const inputFullPath = (form: string) => `${inputPath}/${form}.pdf`;
