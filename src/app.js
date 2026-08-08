//
const express = require("express");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const taskRoutes = require("./routes/tasks");
const requireAuth = require("./middleware/auth");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
