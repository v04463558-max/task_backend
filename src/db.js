const { PrismaClient } = require("@prisma/client");
// Prisma 7 requires a driver adapter for MySQL.
// Official package is @prisma/adapter-mariadb (works with MySQL and MariaDB).
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const env = require("./config/env");

/**
 * Convert a mysql:// / mariadb:// URL into a PoolConfig object.
 * Prefer object config over raw strings so special characters in passwords
 * (common on Railway) do not break the mariadb URL parser.
 */
function toMariaDbConfig(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error(
      `Invalid database URL. Expected mysql://USER:PASSWORD@HOST:PORT/DATABASE, got: ${String(databaseUrl).slice(0, 32)}…`,
    );
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, "")).split(
    "/",
  )[0];

  if (!url.hostname || !database) {
    throw new Error(
      "Invalid database URL: host and database name are required (mysql://user:pass@host:port/dbname).",
    );
  }

  const config = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username || ""),
    password: decodeURIComponent(url.password || ""),
    database,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10_000,
    // MySQL 8 caching_sha2_password over TCP (Railway private + public).
    allowPublicKeyRetrieval: true,
  };

  // Optional SSL: set DB_SSL=true (or sslmode=require in the URL) for public proxies.
  const sslMode = url.searchParams.get("sslmode") || url.searchParams.get("ssl");
  const wantSsl =
    process.env.DB_SSL === "true" ||
    process.env.MYSQL_SSL === "true" ||
    sslMode === "require" ||
    sslMode === "true" ||
    sslMode === "1";

  if (wantSsl) {
    config.ssl = { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" };
  }

  return config;
}

const adapter = new PrismaMariaDb(toMariaDbConfig(env.databaseUrl));
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
