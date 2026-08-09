const dotenv = require("dotenv");

// Loads .env locally. On Railway, Variables are already in process.env
// and dotenv will not override them by default.
dotenv.config();

/**
 * Build a mysql:// URL from discrete env vars.
 * Covers Railway MySQL plugin vars (MYSQLHOST, …) and common DB_* aliases.
 */
function buildDatabaseUrlFromParts() {
  const host =
    process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOST ||
    process.env.DB_HOSTNAME;
  const user =
    process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    process.env.DB_USERNAME ||
    process.env.DB_USER;
  // Password may be empty string on some local setups — treat only missing as absent.
  const pass =
    process.env.MYSQLPASSWORD ??
    process.env.MYSQL_PASSWORD ??
    process.env.DB_PASSWORD;
  const name =
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DATABASE ||
    process.env.DB_NAME;
  const port =
    process.env.MYSQLPORT ||
    process.env.MYSQL_PORT ||
    process.env.DB_PORT;
  const protocol = process.env.DB_PROTOCOL || "mysql";

  if (host && user != null && user !== "" && pass != null && name) {
    const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
    const hostPort = port ? `${host}:${port}` : host;
    return `${protocol}://${auth}@${hostPort}/${name}`;
  }

  return null;
}

/**
 * Resolve a database URL for local + Railway.
 * Railway MySQL often injects MYSQL_URL / MYSQLHOST… but not DATABASE_URL
 * unless you map it yourself — support both so deploy does not crash.
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
  throw new Error(
    "Missing database connection. Set DATABASE_URL (recommended), or link a Railway MySQL service " +
      "so MYSQL_URL / MYSQLHOST+MYSQLUSER+MYSQLPASSWORD+MYSQLDATABASE are available. " +
      "Local example: mysql://USER:PASSWORD@HOST:PORT/DATABASE",
  );
}

const env = {
  port: Number(process.env.PORT) || 4000,
  // Bind all interfaces so Railway's proxy can reach the process.
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
