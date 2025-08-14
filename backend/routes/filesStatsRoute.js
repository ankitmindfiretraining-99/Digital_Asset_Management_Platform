const express = require("express");
const router = express.Router();
const FilesStatsController = require("../controllers/FilesStatsController");

router.get("/stats", FilesStatsController);

module.exports = router;
