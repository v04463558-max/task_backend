const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
});

server.on("error", (error) => {
  console.error("API server failed to start:", error);
  process.exit(1);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down…`);
  server.close(() => {
    console.log("API server closed");
    process.exit(0);
  });
  // Force exit if connections hang (Railway deploy swap).
  setTimeout(() => process.exit(0), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
