const express = require("express");
const router = express.Router();
const multer = require("multer");
const UploadController = require("../controllers/UploadController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.array("files"), UploadController);
module.exports = router;
