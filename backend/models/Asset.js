const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  filename: String,
  fileType: String,
  resolutions: [String],
  thumbnailUrl: String,
  metadata: Object,
  minioUrls: [String],
});

module.exports = mongoose.model("Asset", assetSchema);

