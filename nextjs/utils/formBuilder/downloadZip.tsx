import saveAs from 'file-saver';
import JSZip from 'jszip';
import { Form } from '@/types/forms';

export function downloadZip(forms: Form[]) {
  if (forms.length === 0) {
    return null;
  }

  const zipFile = Object.keys(forms[0])[0].split('-')[0].trim();

  const createZipPromise = new Promise((resolve, reject) => {
    const zip = new JSZip();
    // const folder = zip.folder("forms");
    const fetchPromise = async () => {
      await Promise.all(
        forms.map(async (form, n) => {
          //Creates a new promise for each form that resolves
          // when the form is fetched and added to the zip
          const title = Object.keys(form)[0];
          let url = Object.values(form)[0];

          if (!url) {
            return;
          }

          const filename = title.split('-')[1]?.trim();

          const content = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/pdf',
            },
          });

          const blob = await content.blob();

          zip?.file(filename + '.pdf', blob);
        }),
      );
    };
    fetchPromise().then(() => {
      resolve(zip);
    });
  });

  createZipPromise.then((value) => {
    const zip = value as JSZip;

    zip.generateAsync({ type: 'blob' }).then(function (content: any) {
      saveAs(content, zipFile ? `${zipFile}.zip` : 'forms.zip');
    });
  });

  return null;
}
