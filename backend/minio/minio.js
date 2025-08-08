const {Client}  = require("minio");
require("dotenv").config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET;

async function uploadToMinio(buffer, filename, mimetype) {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) await minioClient.makeBucket(BUCKET);
  await minioClient.putObject(BUCKET, filename, buffer, {
    "Content-Type": mimetype,
  });
   console.log(`Bucket ${BUCKET} created successfully`);
}

module.exports = { uploadToMinio };
