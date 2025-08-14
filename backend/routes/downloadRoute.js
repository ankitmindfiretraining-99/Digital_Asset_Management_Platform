const express = require("express");
const router = express.Router();
const DownloadController = require("../controllers/DownloadController");

router.get("/:folder/:filename", DownloadController);

module.exports = router;
