const { minioClient } = require("../minio/minio");
const Asset = require("../models/Asset");

const FilesController = async (req, res) => {
  try {
    if (!process.env.MINIO_BUCKET) {
      return res
        .status(500)
        .json({ error: "MINIO_BUCKET env variable is missing" });
    }

    const { type, uploaded } = req.query;
    const objects = [];
    let responded = false;

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];

    const stream = minioClient.listObjectsV2(
      process.env.MINIO_BUCKET,
      "original/",
      true
    );

    stream.on("data", (obj) => {
      objects.push(obj);
    });

    stream.on("end", async () => {
      if (responded) return;
      responded = true;

      const assetDocs = await Asset.find({}, "filename downloadCount").lean();

      const totalUploads = objects.length;

      let files = await Promise.all(
        objects.map(async (obj) => {
          const parts = obj.name.split("/");
          const folder = parts.length > 1 ? parts[0] : null;
          const filename =
            parts.length > 1 ? parts.slice(1).join("/") : parts[0];
          const pureFilename = filename.split("-").slice(1).join("-");

          const fileExt = obj.name.split(".").pop().toLowerCase();

          let category = "other";
          if (imageExtensions.includes(fileExt)) category = "image";
          else if (videoExtensions.includes(fileExt)) category = "video";

          // Get download count from MongoDB
          const assetRecord = assetDocs.find(
            (a) => a.filename === pureFilename
          );

          return {
            name: filename,
            folder: folder,
            size: obj.size,
            lastModified: obj.lastModified,
            type: category,
            downloadCount: assetRecord ? assetRecord.downloadCount : 0,
            url: await minioClient.presignedGetObject(
              process.env.MINIO_BUCKET,
              obj.name,
              24 * 60 * 60
            ),
            downloadUrl: `http://localhost:5000/download/${folder}/${encodeURIComponent(
              filename
            )}`,
            totalUploads,
          };
        })
      );

      // File type filter
      if (type) {
        files = files.filter(
          (f) => f.type.toLowerCase() === type.toLowerCase()
        );
      }

      // Uploaded date filter
      if (uploaded) {
        const now = new Date();
        let startDate;

        if (uploaded === "today") {
          startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (uploaded === "7days") {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
        } else if (uploaded === "30days") {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
        }

        if (startDate) {
          files = files.filter((f) => new Date(f.lastModified) >= startDate);
        }
      }

      res.json(files);
    });

    stream.on("error", (err) => {
      if (responded) return;
      responded = true;
      res.status(500).json({ error: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = FilesController;
