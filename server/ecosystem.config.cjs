module.exports = {
  apps: [
    {
      name: "collab-node-5000",
      script: "./server.js",
      env: {
        PORT: 5000,
        REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379"
      }
    },
    {
      name: "collab-node-5001",
      script: "./server.js",
      env: {
        PORT: 5001,
        REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379"
      }
    },
    {
      name: "collab-node-5002",
      script: "./server.js",
      env: {
        PORT: 5002,
        REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379"
      }
    }
  ]
};