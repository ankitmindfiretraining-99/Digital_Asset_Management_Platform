const { uploadToMinio } = require("../minio/minio");
const Asset = require("../models/Asset");
const { assetQueue } = require("../queues/assetQueue");

const Upload = async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  const uploadedFiles = [];

  try {
    await Promise.all(
      files.map(async (file) => {
       
         const minioKey = `original/${Date.now()}-${file.originalname}`;
         const minioUrl = await uploadToMinio(
           file.buffer,
           minioKey,
           file.mimetype
         );

        // Save metadata to MongoDB
        const newAsset = await Asset.create({
          filename: file.originalname,
          status: "processing",
          createdAt: new Date(),
          originalFileUrl: minioUrl,
        });

        uploadedFiles.push(newAsset);

        // Add job to queue for background processing
        await assetQueue.add("process", {
          minioKey,
          originalName: file.originalname,
          assetId: newAsset._id.toString(),
        });
      })
    );

    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = Upload;
