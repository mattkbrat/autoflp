export const rootPath = process.cwd();

console.log('rootPath', rootPath);

// /lib/forms
export const inputPath = `/forms`;

// /public/forms/filled
// export const formsPath = `${rootPath}/public/forms/filled/`;
export const formsPath = `${inputPath}/filled/`;

export const outputFullPath = (output: string) =>
  `${formsPath}${output.includes('.pdf') ? output : output + '.pdf'}`;

export const inputFullPath = (form: string) => `${inputPath}/${form}.pdf`;
