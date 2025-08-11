require("dotenv").config();
require("../db/connection");

const { Worker } = require("bullmq");
const { spawn } = require("child_process");
const redisConnection = require("../config/redis-connection");
const sharp = require("sharp");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const path = require("path");
const fs = require("fs");
const os = require("os");
const Asset = require("../models/Asset");
const { uploadToMinio, downloadFromMinio } = require("../minio/minio");

const TMP_DIR = os.tmpdir();

function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn(ffprobePath, [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    let data = "";
    let error = "";

    ffprobe.stdout.on("data", (chunk) => (data += chunk));
    ffprobe.stderr.on("data", (chunk) => (error += chunk));

    ffprobe.on("close", (code) => {
      if (code === 0) resolve(JSON.parse(data));
      else reject(new Error(`ffprobe failed: ${error}`));
    });

    ffprobe.on("error", reject);
  });
}

function transcodeVideo(inputPath, resolution, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      "-y",
      "-i",
      inputPath,
      "-vf",
      `scale=${resolution}`,
      "-c:a",
      "copy",
      outputPath,
    ]);

    let error = "";
    ffmpeg.stderr.on("data", (chunk) => (error += chunk));

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg failed with code ${code}: ${error}`));
    });

    ffmpeg.on("error", reject);
  });
}


async function generateThumbnail(inputPath, outputPath) {
  await sharp(inputPath).resize(200, 200).toFile(outputPath);
  return outputPath;
}

const worker = new Worker(
  "asset-processing",
  async (job) => {
    const { minioKey, originalName, assetId } = job.data;
    const fileExt = path.extname(originalName).toLowerCase();

    // Download from MinIO
    const localFilePath = path.join(
      TMP_DIR,
      `${Date.now()}-${path.basename(originalName)}`
    );
    await downloadFromMinio(minioKey, localFilePath);

    console.log(`Processing file: ${localFilePath}`);
    let fileType;
    let minioUrls = [];
    let resolutions = [];
    let metadata = {};
    let thumbnailUrl = null;

    if ([".mp4", ".mov", ".mkv", ".avi"].includes(fileExt)) {
      // Video Processing
      fileType = "video";
      metadata = await getVideoMetadata(localFilePath);

      // Transcode to 1080p & 720p
      const resList = ["1920:1080", "1280:720"];
      for (let res of resList) {
        const outputFile = path.join(
          TMP_DIR,
          `transcoded-${res}-${originalName}`
        );
        await transcodeVideo(localFilePath, res, outputFile);
        const minioUrl = await uploadToMinio(
          outputFile,
          `videos/${path.basename(outputFile)}`,
          "video/mp4"
        );
        minioUrls.push(minioUrl);
        resolutions.push(res);
        fs.unlinkSync(outputFile);
      }
    } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(fileExt)) {
      // Image Processing
      fileType = "image";

      // Extract metadata
      const sharpMeta = await sharp(localFilePath).metadata();
      metadata = sharpMeta;

      // Generate thumbnail
      const thumbPath = path.join(TMP_DIR, `thumb-${originalName}`);

      await generateThumbnail(localFilePath, thumbPath);
      thumbnailUrl = await uploadToMinio(
        thumbPath,
        `thumbnails/${path.basename(thumbPath)}`,
        "image/jpeg"
      );
      fs.unlinkSync(thumbPath);

      // Upload original image
      const minioUrl = await uploadToMinio(
        localFilePath,
        `images/${originalName}`,
        fileExt === ".png" ? "image/png" : "image/jpeg"
      );
      minioUrls.push(minioUrl);
    }

    // Save or update metadata in MongoDB
    await Asset.findOneAndUpdate(
      { _id: assetId },
      {
        $set: {
          fileType,
          resolutions,
          thumbnailUrl,
          metadata,
          minioUrls,
        },
      },
      { upsert: true, new: true }
    );

    // Remove local temp file
    fs.unlinkSync(localFilePath);

    console.log(`Processing completed for ${originalName}`);
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err));