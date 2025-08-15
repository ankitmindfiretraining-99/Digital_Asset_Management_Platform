const express = require("express");
const cors = require("cors");
const config = require("./db/connection");
const dotenv = require("dotenv");
const uploadFileRoute = require("./routes/uploadFileRoute");
const filesRoute = require("./routes/filesRoute")
const downloadRoute = require("./routes/downloadRoute")

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/upload", uploadFileRoute);
app.use("/files", filesRoute);
app.use("/download", downloadRoute);

dotenv.config();

// start the Express server
if (config) {
  app.listen(PORT, () => {
    console.log(`SERVER STARTED ${process.env.PORT}`);
  });
}
