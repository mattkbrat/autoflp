import JSZip from 'jszip';

const zip = new JSZip();

const zipper = async (files: any, filename: string) => {
  if (typeof Document === 'undefined') {
    throw 'Document is undefined';
  }

  const content = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(content);

  const link = document.createElement('a');

  link.href = url;

  if (filename.includes('.zip')) {
    filename = filename.replace('.zip', '');
  }

  filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.zip';

  link.download = filename;

  return link;
};

export default zipper;
