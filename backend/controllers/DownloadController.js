const { minioClient } = require("../minio/minio");

const DownloadController = async (req, res) => {
  const { folder, filename } = req.params;
  const decodedFilename = decodeURIComponent(filename);
  try {
    const stream = await minioClient.getObject(
      process.env.MINIO_BUCKET,
      `${folder}/${decodedFilename}`
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${decodedFilename}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    stream.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = DownloadController;
