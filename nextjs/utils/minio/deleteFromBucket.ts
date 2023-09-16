import { Client } from 'minio';
import { minioClient } from '@/lib/minio';
import listObjects from '@/utils/minio/listObjects';

const deleteFromBucket = async (bucketName: string, fileName?: string) => {
  let filesToDelete = [fileName];
  let deletedFiles: string[] = [];

  if (filesToDelete.length === 0) {
    const matchingFiles = await listObjects(bucketName, '');
  }

  for (const file of filesToDelete) {
    if (!file) continue;
    await minioClient
      .removeObject(bucketName, file)
      .then(() => {
        deletedFiles.push(file);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return deletedFiles;
};

export default deleteFromBucket;
