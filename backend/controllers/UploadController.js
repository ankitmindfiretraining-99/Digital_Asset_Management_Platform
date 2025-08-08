const { uploadToMinio } = require("../minio/minio");

const Upload = async (req, res) => {
  const files = req.files;
console.log("Files received:", files);
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

 try {
   const uploaded = await Promise.all(
     files.map(async (file) => {
       const filename = `${Date.now()}-${file.originalname}`;
    //    const storagePath = `assets/${filename}`;

       await uploadToMinio(file.buffer, filename, file.mimetype);

       // Save metadata to MongoDB
    //    const asset = new Asset({
    //      filename,
    //      originalName: file.originalname,
    //      size: file.size,
    //      mimeType: file.mimetype,
    //      storagePath,
    //    });
    //    await asset.save();

       return { filename };
     })
   );

   res.json({ uploaded });
 } catch (err) {
   console.error("Upload failed:", err);
   res.status(500).json({ error: "Upload failed" });
 }
};

module.exports = Upload;
