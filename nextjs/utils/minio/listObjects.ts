import { minioClient } from '@/lib/minio';

const listObjects = async (bucketName: string, prefix: string) => {
  const matchingFiles: (string | undefined)[] = [];

  await minioClient
    .listObjects(bucketName, prefix, true)
    .on('data', (obj) => {
      matchingFiles.push(obj.name);
    })
    .on('error', (err) => {
      console.error(err);
    })
    .on('end', () => {
      console.log('End');
    });

  return matchingFiles.filter(Boolean) as string[];
};

export default listObjects;
