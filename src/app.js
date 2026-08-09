//
const express = require("express");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const taskRoutes = require("./routes/tasks");
const requireAuth = require("./middleware/auth");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const env = require("./config/env");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", env.corsOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.use(express.json());

// Root — so opening the Railway public URL does not look "broken"
app.get("/", (req, res) => {
  res.json({
    name: "Task Tracker API",
    status: "ok",
    health: "/api/health",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me",
      },
      categories: "/api/categories",
      tasks: "/api/tasks",
    },
  });
});

app.get("/health", (req, res) => {
  res.redirect(302, "/api/health");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    databaseConfigured: Boolean(env.databaseUrl),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
