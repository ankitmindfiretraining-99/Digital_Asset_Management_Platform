require("dotenv").config();
const fs = require("fs");
const {Client}  = require("minio");

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET;

// Upload file to MinIO
async function uploadToMinio(fileInput, filename, mimetype) {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) await minioClient.makeBucket(BUCKET);

  if (Buffer.isBuffer(fileInput)) {
    // Buffer upload
    await minioClient.putObject(BUCKET, filename, fileInput, {
      "Content-Type": mimetype,
    });
  } else if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
    // File path upload
    await minioClient.fPutObject(BUCKET, filename, fileInput, {
      "Content-Type": mimetype || "application/octet-stream",
    });
  } else {
    throw new Error("Invalid file input for uploadToMinio");
  }

  return `${process.env.MINIO_PUBLIC_URL}/${BUCKET}/${filename}`;
}

async function downloadFromMinio(minioKey, localPath) {
  return new Promise((resolve, reject) => {
    minioClient.fGetObject(
      process.env.MINIO_BUCKET,
      minioKey,
      localPath,
      (err) => {
        if (err) return reject(err);
        resolve(localPath);
      }
    );
  });
}

module.exports = { uploadToMinio, downloadFromMinio, minioClient };
