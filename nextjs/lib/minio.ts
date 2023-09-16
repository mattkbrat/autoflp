import { Client } from 'minio';

const endPoint = process.env.MINIO_ENDPOINT;
const port = process.env.MINIO_PORT;
const useSSL = process.env.MINIO_USE_SSL;
const accessKey = process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_SECRET_KEY;

if (!endPoint || !port || !useSSL || !accessKey || !secretKey) {
  throw new Error('Minio environment variables not set');
}

const portNumber = parseInt(port);

if (isNaN(portNumber)) {
  throw new Error('Port number is not a number');
}

if (useSSL !== 'true' && useSSL !== 'false') {
  throw new Error('Use SSL is not a boolean');
}

const sslBool = useSSL === 'true';

// Instantiate the minio client with the endpoint
// and access keys as shown below.
export const minioClient = new Client({
  endPoint,
  port: portNumber,
  useSSL: sslBool,
  accessKey,
  secretKey,
});
