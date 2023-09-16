import { minioClient } from '@/lib/minio';

const bucketName = 'filled';

const validForOneDay = 24 * 60 * 60;

const region = process.env.MINIO_REGION;
const bucketId = process.env.MINIO_BUCKET_ID;

const filledbucket = `filled-${bucketId}`;

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

  // check that the bucket exists

  await minioClient.bucketExists('filled', function (err, exists) {
    if (err) {
      return console.log(err);
    }
    if (!exists) {
      return minioClient.makeBucket(filledbucket, region, function (err) {
        if (err) {
          return console.log('Error creating bucket.', err);
        }
        console.log('Bucket created successfully in', region);
      });
    }
    console.log('Bucket exists.');
  });

  try {
    await minioClient.putObject(bucket, filename, file, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + filename + '"',
    });
  } catch (error) {
    console.error(`Error uploading ${filename}`, error);
  }

  //   get the object's presigned url

  try {
    return await minioClient.presignedGetObject(bucket, filename, validForOneDay);
  } catch (error) {
    console.error(`Error getting presigned url for ${filename}`, error);
    return null;
  }
};
