const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  filename: String,
  fileType: String,
  downloadCount:Number,
});

module.exports = mongoose.model("Asset", assetSchema);

