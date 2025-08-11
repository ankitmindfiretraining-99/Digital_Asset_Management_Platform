const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis-connection");

const assetQueue = new Queue("asset-processing", {
  connection: redisConnection,
});

module.exports = { assetQueue };
