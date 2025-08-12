const express = require("express");
const router = express.Router();
const FilesController = require("../controllers/filesController");

router.get("/", FilesController);

module.exports = router;