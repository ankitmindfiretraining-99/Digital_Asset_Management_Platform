const { minioClient } = require("../minio/minio");

const FilesStatsController = async (req, res) => {
  try {
    if (!process.env.MINIO_BUCKET) {
      return res.status(500).json({ error: "MINIO_BUCKET env variable is missing" });
    }

    const objects = [];
    let responded = false;

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

      // Upload counts
      const totalUploads = objects.length;

      res.json({
        totalUploads
      });
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

module.exports = FilesStatsController;
