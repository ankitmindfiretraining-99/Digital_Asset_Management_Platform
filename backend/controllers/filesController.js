const { minioClient } = require("../minio/minio");

const FilesController = async (req, res) => {
  try {
    if (!process.env.MINIO_BUCKET) {
      return res
        .status(500)
        .json({ error: "MINIO_BUCKET env variable is missing" });
    }

    const objects = [];
    const stream = minioClient.listObjectsV2(
      process.env.MINIO_BUCKET,
      "",
      true
    );
    stream.on("data", (obj) => {
      objects.push(obj);
    });

    stream.on("end", async () => {
      const files = await Promise.all(
        objects.map(async (obj) => ({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          type: obj.name.split(".").pop().toLowerCase(),
          url: await minioClient.presignedGetObject(
            process.env.MINIO_BUCKET,
            obj.name,
            24 * 60 * 60
          ),
        }))
      );
      res.json(files);
    });

    stream.on("error", (err) => res.status(500).json({ error: err.message }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = FilesController;
