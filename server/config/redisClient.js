require("dotenv").config();
const Redis = require("ioredis");

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

redisClient.on("connect", () => console.log("✅ Redis client connected"));
redisClient.on("error", (err) => console.error("❌ Redis client error:", err));

module.exports = redisClient;
