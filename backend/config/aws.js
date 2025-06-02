import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.SPACES_REGION,
  endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,

  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  },
  httpOptions: {
    timeout: 5000,
  },
});

export { s3 };
