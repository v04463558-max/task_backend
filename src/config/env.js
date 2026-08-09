const dotenv = require("dotenv");

// Loads .env locally. On Railway, Variables are already in process.env
// and dotenv will not override them by default.
dotenv.config();

/**
 * Preferred app env vars (local + Railway):
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DATABASE, PORT
 *
 * Fallbacks keep Railway MySQL plugin / DATABASE_URL working so deploy
 * does not crash if you only linked the MySQL service.
 */
function readDbParts() {
  const host =
    process.env.DB_HOST ||
    process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOSTNAME ||
    "localhost";

  const user =
    process.env.DB_USERNAME ||
    process.env.DB_USER ||
    process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    "";

  // Empty password is valid (local root often has none).
  const pass =
    process.env.DB_PASSWORD ??
    process.env.MYSQLPASSWORD ??
    process.env.MYSQL_PASSWORD ??
    "";

  const name =
    process.env.DATABASE ||
    process.env.DB_NAME ||
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    "";

  const port =
    process.env.DB_PORT ||
    process.env.MYSQLPORT ||
    process.env.MYSQL_PORT ||
    "3306";

  return { host, user, pass, name, port };
}

function buildDatabaseUrlFromParts() {
  const { host, user, pass, name, port } = readDbParts();

  // Need at least username + database name to build a URL.
  if (!user || !name) return null;

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
  const hostPort = port ? `${host}:${port}` : host;
  const protocol = process.env.DB_PROTOCOL || "mysql";
  return `${protocol}://${auth}@${hostPort}/${name}`;
}

/**
 * Resolve MySQL URL for local + Railway.
 * Order: full URL vars first, then DB_* (and MYSQL*) parts.
 */
function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.MYSQL_URL,
    process.env.MYSQL_PRIVATE_URL,
    process.env.MYSQL_PUBLIC_URL,
    process.env.RAILWAY_DATABASE_URL,
    process.env.PRISMA_DATABASE_URL,
    buildDatabaseUrlFromParts(),
  ];

  for (const value of candidates) {
    if (value == null) continue;
    const trimmed = String(value).trim();
    if (trimmed) return trimmed;
  }

  return null;
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  // Do not hard-crash the process: Railway health checks need the server up.
  // API routes that touch the DB will fail with a clear error instead.
  console.error(
    "[env] Missing database config. Set these variables:\n" +
      "  DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DATABASE\n" +
      "  (and PORT for the API)\n" +
      "Or set DATABASE_URL / link a Railway MySQL service (MYSQL_*).",
  );
}

const env = {
  // Railway injects PORT; local default 3000.
  port: Number(process.env.PORT) || 3000,
  // Bind all interfaces so Railway's proxy can reach the process.
  // Locally you still reach it via http://localhost:<PORT>
  host: process.env.HOST || "0.0.0.0",
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
  jwtExpiresInSeconds:
    Number(process.env.JWT_EXPIRES_IN_SECONDS) || 60 * 60 * 24 * 7,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
};

module.exports = env;
module.exports.resolveDatabaseUrl = resolveDatabaseUrl;
module.exports.buildDatabaseUrlFromParts = buildDatabaseUrlFromParts;
