const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

server.on("error", (error) => {
  console.error("API server failed to start:", error);
  process.exit(1);
});

server.on("close", () => {
  console.log("API server closed");
});
