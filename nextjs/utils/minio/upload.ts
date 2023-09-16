import { minioClient } from '@/lib/minio';

const bucketName = 'filled';

const validForOneDay = 24 * 60 * 60;

export const upload = async ({
  bucket = bucketName,
  filename,
  file,
}: {
  bucket?: string;
  filename: string;
  file: string | Buffer;
}) => {
  if (typeof file === 'string') {
    file = Buffer.from(file);
  }

  try {
    await minioClient.putObject(bucket, filename, file, {
      'Content-Type': 'application/pdf',
    });
  } catch (error) {
    console.error(error);
  }

  //   get the object's presigned url

  return await minioClient.presignedGetObject(bucket, filename, validForOneDay);
};
